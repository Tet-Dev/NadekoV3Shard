const {GuildCommand} = require("eris-boiler/lib");
const {ReactionCollector, MessageCollector} = require("eris-collector");
const {method} = require("lodash");
const {arg} = require("mathjs");
const requestAPI = require("request");
const fs = require("fs");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const download = (url, path, callback) => {
	requestAPI.head(url, (err, res, body) => {
		requestAPI(url)
			.pipe(fs.createWriteStream(path))
			.on("close", callback);
	});
};

function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function readFullFile(path) {
	return new Promise(function (resolve, reject) {
		fs.readFile(path, (err, data) => err ? reject(err) : resolve(data));
	});


}

//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}

function getNextMessageForPrompt(bot, msg) {
	return new Promise((res, rej) => {
		let msgs = new MessageCollector(bot, msg.channel, (m) => m.author.id === msg.author.id, {max: 1});
		msgs.on("collect", masg => {
			res(masg);
		});
		setTimeout(() => {
			res("to");
		}, 300000);
	});
}

module.exports = new GuildCommand({
	name: "ripemote", // name of command
	description: "Takes an emote from a message and adds it to your server!",
	run: (async (client, {msg, params}) => {
		if (!await client.permissionsHandler.checkForPerm(msg.member, "ripEmote")) return "You are lacking the permission node `ripEmote`";
		await msg.channel.createMessage("Please specify a message link to a message(must be on this server!) OR please use an emote OR type `cancel` to cancel");
		let res1 = await getNextMessageForPrompt(client, msg);
		while (res1.content && res1.content.toLowerCase() !== "cancel" && !res1.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g) && !res1.content.match(/https:\/(\/canary.|\/ptb.|\/)discord.com\/channels\/\d+\/\d+\/\d+/g)) {
			await client.createMessage(msg.channel.id, "Error! Your response was invalid! \nPlease specify a message link to a message(must be on this server!) OR please use an emote OR type `cancel` to cancel");
			res1 = await getNextMessageForPrompt(client, msg);
		}
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Ripping Cancelled!";
		}
		let ripemot = res1.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g) ? res1.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g)[0] : null;
		if (!ripemot) {
			let args = res1.content.replace(/https:\/(\/canary.|\/ptb.|\/)discord.com\/channels/g, "").split("/");
			args.shift();
			if (args[0] !== msg.guildID) return "Message Link not from server!";
			let mentionMsg = await client.getMessage(args[1], args[2]).catch((er) => {
			});
			if (!mentionMsg || (!mentionMsg.content && !mentionMsg.embeds.length)) return "Either I dont have access to that message the message is does not have text or it doesnt exist!";
			let emoots = mentionMsg.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g);
			emoots = emoots.concat(mentionMsg.embeds.length ? JSON.stringify(mentionMsg.embeds).match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g) : []);
			let pemotes2 = emoots.map(x => {
				return x.match(/:\w+:/)[0].replace(/:/g, "");
			});
			let pemotes = pemotes2.join(" ");
			await client.createMessage(msg.channel.id, {
				content: "Please type the emote's name!(or cancel to cancel)",
				embed: {
					description: "Possible Emotes `" + pemotes + "`\nNo colons!"
				}
			});
			res1 = await getNextMessageForPrompt(client, msg);
			while (res1.content && !pemotes2.includes(res1.content) && res1.content.toLowerCase() !== "cancel") {
				await client.createMessage(msg.channel.id, {
					content: "Invalid response!(Make sure there are no colons(`:`). Please type the emote's name!(or cancel)",
					embed: {
						description: "Possible Emotes `" + pemotes + "`\nNo colons!"
					}
				});
				res1 = await getNextMessageForPrompt(client, msg);
			}
			ripemot = emoots.filter((x, ind) => pemotes2[ind] === res1.content)[0];
		}
		let fp = "./temp/" + genID(15) + "." + (ripemot.match(/<a:/) ? "gif" : "png");
		let emotId = ripemot.match(/\d+>/)[0].replace(">", "");
		download(`https://cdn.discordapp.com/emojis/${emotId}.${(ripemot.match(/<a:/) ? "gif" : "png")}`, fp, async () => {
			async function ea() {
				const file_buffer = await readFullFile(fp);
				const contents_in_base64 = file_buffer.toString("base64");
				let emo = await msg.member.guild.createEmoji({
					name: ripemot.split(":")[1],
					image: "data:image/png;base64," + contents_in_base64
				}, `Ripped Emote. Requested by : ${msg.author.id}`);
				await client.createMessage(msg.channel.id, "Created! <" + (ripemot.match(/<a:/) ? "a" : "") + ":" + emo.name + ":" + emo.id + ">");
				fs.unlink(fp, () => {
				});
			}

			ea();
		});


	}),
	options: {
		// parameters: ["A Link to the message or the emote!"],
		// aliases: ["ripemote"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});