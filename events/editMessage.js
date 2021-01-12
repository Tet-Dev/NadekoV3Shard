const { DiscordEvent } = require("eris-boiler/lib");
const axios = require("axios");
const ms = require("ms");
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
function parseEmotes(str) {
	let allEStr = str.split("|").filter(x => x);
	return allEStr.map(x => {
		let miniargs = x.split(",");
		let msgChannel = miniargs[0].split("§");
		let emoot = miniargs[1];
		return {
			channel: msgChannel[0],
			id: msgChannel[1],
			emote: miniargs[1].replace("<", "").replace(/\:/g, "").replace(">", ""),
			roleID: miniargs[2]
		};
	});
}
module.exports = new DiscordEvent({
	name: "messageUpdate",
	run: async (bot, newMsg, msg,) => {
		try {
			
			if (!newMsg || !msg|| !msg.content) return;
			let snipe = bot.esnipes.get(newMsg.channel.id);
			if (!snipe) snipe = [];
			if (snipe.length > 350) {
				snipe.shift();
			}
			msg.author = newMsg.author;
			msg.channel = newMsg.channel;
			msg.id = newMsg.id;
			snipe.push(msg);
			bot.esnipes.set(newMsg.channel.id, snipe);
		} catch (er) {
			console.trace(er);
		}
	}
});

