const { DiscordEvent } = require("eris-boiler/lib");
const axios = require("axios");
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
// let reroCache = new Map();
module.exports = new DiscordEvent({
	name: "voiceChannelJoin",
	run: async (bot, mem, chan) => {
		if (chan.name === "Dazai Private Lounge" && mem.id !== bot.user.id){
			mem.edit({channelID: null});
			let dmchan = await bot.getDMChannel(mem.id);
			dmchan.createMessage(`Hey ${mem.nick || mem.user.username}, you do not have access to join that private lounge.`);
		} 
		
	}
});

