const { DiscordEvent } = require("eris-boiler/lib");
const axios = require("axios");
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
module.exports = new DiscordEvent({
	name: "guildMemberRemove",
	run: async (bot,guild, member) => {
		let gdata = await bot.SQLHandler.getGuild(guild.id);

		// let dmMsg = gdata.joindmmsg;
		// if (dmMsg !== "none") {
		// 	let pchan = await bot.getDMChannel(member.author.id);
		// 	pchan.createMessage(dmMsg.replace(/\{USERNAME\}/g,member.user.username).replace(/\{MENTION\}/g,member.user.mention).replace(/\{I\D\}/g,member.user.id));
		// }
		if (gdata.leavemsg === "none" || !gdata.leavemsg) return;
		let leavechan = gdata.leavechan !== "none"? (await bot.getRESTChannel(gdata.leavechan).catch(er=>console.trace(er))) : null;
		if (!leavechan) {
			return;
		}
		leavechan.createMessage(gdata.leavemsg.replace(/\{USERNAME\}/g,member.user.username).replace(/\{MENTION\}/g,member.user.mention).replace(/\{I\D\}/g,member.user.id));
		
		
	}
});

