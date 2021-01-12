const { DiscordEvent } = require("eris-boiler/lib");
const { map } = require("lodash");
// const { logger } = require("../util");
let nickLocks = new Map();
// nicknameWindo
module.exports = new DiscordEvent({
	name: "guildMemberUpdate",
	run: async (bot, guild,member, oldMember ) => {
		if (oldMember.nick !== member.nick){
			let preChanged;
			if (nickLocks.has(member.guild.id+","+member.id)){
				if (member.nick !== nickLocks.get(member.guild.id+","+member.id)){
					member.edit({
						nick: nickLocks.get(member.guild.id+","+member.id)
					});
					preChanged = true;
				}
					
					
			}
			let gData = await bot.SQLHandler.getGuild(guild.id);
			if (!gData.lockedGuildMemberNames){
				return;
				nickLocks.delete(member.guild.id+","+member.id);
				member.edit({
					nick: ""
				});
				return;
			} 
			let splits = gData.lockedGuildMemberNames.split("$$clear$$clear");
			let found = false;
			for (let i = 0; i < splits.length;i++){
				let pair = splits[i].split("$$clear");
				if (pair[0] === member.id){
					found = true;
					member.edit({
						nick: pair[1]
					});
					nickLocks.set(member.guild.id+","+member.id,pair[1]);
				}
			}
			if (!found && preChanged){
				nickLocks.delete(member.guild.id+","+member.id);
				member.edit({
					nick: ""
				});
			}
			
		}
	}
});
