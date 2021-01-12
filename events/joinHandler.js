const { DiscordEvent } = require("eris-boiler/lib");
const axios = require("axios");
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
module.exports = new DiscordEvent({
	name: "guildMemberAdd",
	run: async (bot, guild,member) => {
		let gdata = await bot.
		SQLHandler.getGuild(guild.id).catch(er=>console.trace(er));
		let dmMsg = gdata.joindmmsg;
		if (dmMsg !== "none") {
			let pchan = await bot.getDMChannel(member.user.id);
			pchan.createMessage(dmMsg.replace(/\{USERNAME\}/g,member.user.username).replace(/\{MENTION\}/g,member.user.mention).replace(/\{I\D\}/g,member.user.id));
		}
		if (gdata.joinmsg === "none" || !gdata.joinmsg) return;
		let joinChan = gdata.joinchan !== "none"? (await bot.getRESTChannel(gdata.joinchan).catch(er=>console.trace(er))) : null;
		if (!joinChan) {
			return;
		}
		joinChan.createMessage(gdata.joinmsg.replace(/\{USERNAME\}/g,member.user.username).replace(/\{MENTION\}/g,member.user.mention).replace(/\{I\D\}/g,member.user.id));
		
		
	}
});

