const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
const fs = require("fs");
const { all } = require("mathjs");
const { url } = require("inspector");
const moment = require("moment");
const EmbedPaginator = require("eris-pagination");
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
		try {
			if (!msg.guildID || !(await bot.SQLHandler.getGuild(msg.guildID)).whoping)
				return;
			if ((msg.content.match(/who pinged/g) || msg.content.toLowerCase().includes("who ping")) && msg.content.length < 15) {
				msg.channel.sendTyping();
				let allMessages = await msg.channel.getMessages(400, msg.id, lastMsgMaps.get(msg.author.id));
				allMessages = allMessages.filter(x => x.mentions.includes(msg.author));
				let chunkedMessages = allMessages.chunk_inefficient((allMessages.length >= 11 ? 10 : allMessages.length));
				if (allMessages.length > 1) {
					let pagi = chunkedMessages.map(group=>{
						return {
							title: "Pings from the last 400 messages :) ",
							description: group.map((x, ind) =>
								`Ping from ${x.author.username}#${x.author.discriminator} [[Jump]](https://discord.com/channels/${msg.guildID}/${msg.channel.id}/${x.id}) from ${moment(x.timestamp).fromNow()} `).join("\n")
						};
					});
					await msg.channel.createMessage({
						content: `Most Recent Ping`,
						embed: {
							// title: "Click me to Jump",
							description: allMessages[0].content + `[[Jump]](https://discord.com/channels/${msg.guildID}/${msg.channel.id}/${allMessages[0].id})`,
							author: {
								name: `${allMessages[0].author.username}#${allMessages[0].author.discriminator}`,
								icon_url: allMessages[0].author.dynamicAvatarURL("png", 128),
							},
							// url: ``,
						},
						// message_reference: msg.id
					}); 
					if (pagi.length== 1){
						msg.channel.createMessage({
							embed: pagi[0]
						});
					}else{
						const paginatedEmbed = await EmbedPaginator.createPaginationEmbed(msg, pagi);
					}
					
					
				} else if (allMessages.length == 1) {
					await msg.channel.createMessage({
						content: `Hey ${msg.author.username}#${msg.author.discriminator}, I found 1 Ping from the last 400 messages from ${allMessages[0].author.username}#${allMessages[0].author.discriminator}`,
						embed: {
							// title: "Click me to Jump",
							description: allMessages[0].content + `[[Jump]](https://discord.com/channels/${msg.guildID}/${msg.channel.id}/${allMessages[0].id})`,
							author: {
								name: `${allMessages[0].author.username}#${allMessages[0].author.discriminator}`,
								icon_url: allMessages[0].author.dynamicAvatarURL("png", 128),
							},
							// url: ``,
						},
						// message_reference: msg.id
					});
				} else {
					await msg.channel.createMessage({
						content: `I dont know who pinged you ${msg.author.username}#${msg.author.discriminator}. Could it have been deleted?`
					});
				}
				await msg.channel.createMessage("*If you wish to turn off this feature, do `daz settings whoping off` or replace daz with your server prefix*");
			}
		} catch (error) {
			console.error(error);
		}

	}
	// lastMsgMaps.set(msg.author.id, msg.id);


});

