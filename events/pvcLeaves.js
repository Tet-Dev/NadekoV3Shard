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
// let reroCache = new Map();
module.exports = new DiscordEvent({
	name: "voiceChannelLeave",
	run: async (bot, mem, chan) => {
		if (chan.name === "Dazai Private Lounge") {
			if (chan.voiceMembers.size == 0) chan.delete();
			else { chan.edit({ userLimit: chan.voiceMembers.size }); }
		}
		setTimeout(async () => {
			if (chan.voiceMembers.filter(x=>!x.bot).length == 0) bot.leaveVoiceChannel(chan.id);
		}, 60000);
	}
});

