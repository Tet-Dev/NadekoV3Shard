const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
const { token } = require("morgan");
const { link } = require("fs");
// const { boltzmannDependencies } = require("mathjs");
// const { nuclearMagnetonDependencies } = require("mathjs");
// const { logger } = require("../util");
let uwuSpeakCache = new Map();
// nicknameWindo
// async function checkIfValid(){

// }
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
function hasUwuSpeak(mem) {
	if (!mem) return false;
	let guild = mem.guild;
	let filtered = guild.roles.filter(x => x.name === "UwUSpeak");
	if (filtered.length != 0) return mem.roles.includes(filtered[0].id);
	return false;
}
function findLinks(msg) {
	let split = msg.split(" ");
	let newsplit = [];
	let links = [];
	for (let i = 0; i < split.length; i++) {
		let x = split[i];
		if (x.match(/[https|http]:\/\//) && x.includes("discord.com/") && links.length < 8) {
			links.push(x);
			continue;
		}
		newsplit.push(x);
	}

	links = links.filter(x => x.split("discord.com/")[1].split("/").length === 4).map(x => {
		let ars = x.split("discord.com/")[1].split("/");
		return {
			guildid: ars[1],
			chanid: ars[2],
			msgid: ars[3].match(/\d+/).join(""),
		};
	});
	return {
		msg: newsplit.join(" "),
		links: links,
	};

}
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		
		if (msg.attachments.length) return;
		if (uwuSpeakCache.has(msg.channel.id)) {
			(async () => {
				let data = await bot.SQLHandler.getChannel(msg.channel.id);

				uwuSpeakCache.set(msg.channel.id, data.uwuspeak ? true : false);
			})();
		} else {
			let data = await bot.SQLHandler.getChannel(msg.channel.id);
			uwuSpeakCache.set(msg.channel.id, data.uwuspeak ? true : false);
		}

		let res;


		res = uwuSpeakCache.get(msg.channel.id) || hasUwuSpeak(msg.member);
		if (!res) return;
		if (msg.author.id === bot.user.id) return;
		if (msg.author.discriminator === "0000") return;
		let webHooks = await msg.channel.getWebhooks();
		let hooks = [];
		for (let i = 0; i < webHooks.length; i++) {
			let hook = webHooks[i];
			if (hook.type == 1 && hook.name === "Dazai UwUSpeakHook") {
				hooks.push({ id: hook.id, token: hook.token });
			}
		}
		if (hooks.length < 5) {
			for (let i = 0; i < (5 - hooks.length); i++) {
				let webhookInfo = await msg.channel.createWebhook({ name: "Dazai UwUSpeakHook", avatar: bot.user.avatar }, "For UwuSpeak");
				hooks.push({ id: webhookInfo.id, token: webhookInfo.token });
				// hooks.push("https:\/\/discordapp.com/api/webhooks/" + webhookInfo.id + "/" + webhookInfo.token);
			}
		}

		let data = findLinks(msg.content);
		let linkedmsgs;
		let extraembeds = [];
		if (data.links.length) {
			
			linkedmsgs = await Promise.all(data.links.map(async (x) => {
				let refm = await bot.getMessage(x.chanid, x.msgid);
				if (!refm) return false;
				
				if (refm.embeds.length && data.links.length + extraembeds.length + refm.embeds.length < 9) {
					extraembeds = extraembeds.concat(refm.embeds.map(x => {
						x.title = x.title ? "Ref Embed: " + x.title : "Referenced Embed";
						return x;
					}));
				}
				let imgobj;
				if (refm.attachments.length == 1) {
					imgobj = {
						url: refm.attachments[0].url
					};
				}
				return {
					author: {
						name: refm.author.username || "Unknown",
						// url: 
						icon_url: (refm.author ? refm.author : bot.user).dynamicAvatarURL("png", 256),
					},
					description: (refm.content || "Unknown") + ` [[Jump]](https://discord.com/channels/${x.guildid}/${x.chanid}/${x.msgid})`,
					image: imgobj,

				};
			}));
			linkedmsgs = linkedmsgs.filter(x => x).concat(extraembeds);
			
			linkedmsgs.push({
				"color": null,
				"footer": {
					"text": "This message was modified from an original user message by Dazai."
				}
			});
		}
		msg.content = data.msg;



		const links = msg.content.match(httpRegex);
		if (links) msg.content = msg.content.replace(httpRegex, "{蟹$§$蟹}");
		msg.content = msg.content.replace(/l/g, "w");
		msg.content = msg.content.replace(/r/g, "w");
		msg.content = msg.content.replace(/(?:r|l)/g, "w");
		msg.content = msg.content.replace(/(?:R|L)/g, "W");
		msg.content = msg.content.split("NA").join("å");
		msg.content = msg.content.split("NE").join("é");
		msg.content = msg.content.split("NI").join("î");
		msg.content = msg.content.split("NO").join("ø");
		msg.content = msg.content.split("NU").join("ü");
		msg.content = msg.content.replace(/n([aeiou])/g, "ny$1");
		msg.content = msg.content.replace(/N([aeiou])/g, "Ny$1");
		msg.content = msg.content.replace(/ove/g, "uv");
		msg.content = msg.content.replace(/<@\!/g, "<@\$∞");
		msg.content = msg.content.replace(/\!+/g, " " + faces[Math.floor(Math.random() * faces.length)] + " ");
		msg.content = msg.content.replace(/<@\$∞/g, "<@\!");
		msg.content = msg.content.split("å").join("NYA");
		msg.content = msg.content.split("é").join("NYE");
		msg.content = msg.content.split("î").join("NYI");
		msg.content = msg.content.split("ø").join("NYO");
		msg.content = msg.content.split("ü").join("NYU");
		let Selhook = hooks[(msg.author.id % 10) % hooks.length];
		if (links) {
			for (let i = 0; i < links.length; i++) {
				msg.content = msg.content.replace("{蟹$§$蟹}", links[i]);
			}
		}
		msg.delete();
		let tempitem = {
			allowedMentions:{
				everyone:false,
				roles:false,
				users:false,
			},
			auth: true,
			content: msg.content,
			embeds: linkedmsgs,
			"username": msg.member.nick || msg.author.username,
			avatarURL: msg && msg.author.avatarURL ? msg.author.avatarURL.replace(".jpg", ".png") : bot.user.avatarURL,
			wait: true,
		};
		let t2 = {
			allowedMentions:{
				everyone:false,
				roles:false,
				users:false,
			},
			auth: true,
			content: "...",
			embeds: linkedmsgs,
			"username": msg.member.nick || msg.author.username,
			avatarURL: msg && msg.author.avatarURL ? msg.author.avatarURL.replace(".jpg", ".png") : bot.user.avatarURL,
			wait: true,
		};

		// t2.content = "Loading..."
		let webMsg = await bot.executeWebhook(Selhook.id, Selhook.token, msg.mentions.length ? t2 : tempitem).catch(er => console.trace(er));

		if (msg.mentions.length) {
			await axios(
				{
					method: "patch",
					url: "https://discord.com/api/v8/webhooks/" + Selhook.id + "/" + Selhook.token + "/messages/" + webMsg.id,
					headers: {
						"Content-Type": "application/json"
					},
					data: JSON.stringify(tempitem)
				}
			);
		}

		// bot.webhookEditMessage(bot, webMsg.webhookID, Selhook.token, webMsg.id, tempitem);
		// webMsg.webhookEdit(Selhook.token, tempitem);
		const reactionListener = new ReactionHandler.continuousReactionStream(
			webMsg,
			(userID) => (userID.id ? userID.id : userID) === msg.author.id,
			false,
			{ maxMatches: 1000, time: 60000 * 10 }
		);
		reactionListener.on("reacted", async (event) => {
			if (event.emoji.name.startsWith("❌")) {
				bot.deleteMessage(webMsg.channel.id, webMsg.id);
				webMsg.delete();

			}


		});
	}
});

