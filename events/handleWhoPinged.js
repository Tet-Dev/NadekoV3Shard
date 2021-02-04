const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
const fs = require("fs");
const { all } = require("mathjs");
const { url } = require("inspector");
// const { boltzmannDependencies } = require("mathjs");
// const { nuclearMagnetonDependencies } = require("mathjs");
// const { logger } = require("../util");
let uwuSpeakCache = new Map();
// nicknameWindo
// async function checkIfValid(){

// }
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
function parseLevelRewards(str) {
	return str.split("||").map(x => {
		if (!x) return null;
		let qd = x.split(",");
		return {
			level: qd[0],
			roleID: qd[1],
		};
	}).filter(x => x);
}
const lastMsgMaps = new Map();
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		if (!msg.guildID || !(await bot.SQLHandler.getGuild(msg.guildID)).whoping)
			return;
		if (msg.content.match(/who pinged/g) && msg.content.length < 25) {
			msg.channel.sendTyping();
			let allMessages = await msg.channel.getMessages(400, msg.id, lastMsgMaps.get(msg.author.id));
			if (allMessages.length > 1) {
				await msg.channel.createMessage({
					content: `I found ${allMessages.length} pings from your last message!`,
					embed: {
						title: "Pings",
						description: allMessages.map((x, ind) => {
							return {
								name: `Ping from ${x.author.username}#${x.author.discriminator} [[Jump]](https://discord.com/channels/${msg.guildID}/${msg.channel.id}/${x.id})`
							};
						}).join("\n")
					}
				});
			} else if (allMessages.length == 1) {
				await msg.channel.createMessage({
					content: `1 Ping from ${allMessages[0].author.username}#${allMessages[0].author.discriminator}`,
					embed: {
						title: "Click me to Jump",
						description: allMessages[0].content,
						author: {
							name: `${allMessages[0].author.username}#${allMessages[0].author.discriminator}`,
							url: allMessages[0].author.dynamicAvatarURL("png", 128),
						},
						url: `https://discord.com/channels/${msg.guildID}/${msg.channel.id}/${allMessages[0].id})`,
					}
				});
			}
			await msg.channel.createMessage("If you wish to turn off this feature, do `daz settings whoping off` or replace daz with your server prefix");
		}
		lastMsgMaps.set(msg.author.id, msg.id);

	}
});

