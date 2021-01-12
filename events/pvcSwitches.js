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
	name: "voiceChannelSwitch",
	run: async (bot, mem, newChan, oldChan) => {
		if (newChan.name === "Dazai Private Lounge" && mem.id !== bot.user.id) {
			await mem.edit({ channelID: null });
			let dmchan = await bot.getDMChannel(mem.id);
			dmchan.createMessage(`Hey ${mem.nick || mem.user.username}, you do not have access to join that private lounge.`);
		}
		if (oldChan.name === "Dazai Private Lounge") {
			if (oldChan.voiceMembers.size == 0) oldChan.delete();
		}
		setTimeout(async () => {
			if (newChan.voiceMembers.filter(x => !x.bot).length == 0) bot.leaveVoiceChannel(newChan.id);
		}, 60000);
	}
});

