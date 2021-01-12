const { DiscordEvent } = require("eris-boiler/lib");
const axios = require("axios");
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
	name: "messageDeleteBulk",
	run: async (bot, msgs) => {
		let snipe = bot.snipes.get(msgs[0].channel.id);
		if (!snipe) snipe = [];
		if (msgs.length < 8){
			msgs.forEach(x => {
				if (snipe.length > 350){
					snipe.shift();
				}
				snipe.push(x);
			});
		}
		


		
		bot.snipes.set(msgs[0].channel.id,snipe);
	}
});

