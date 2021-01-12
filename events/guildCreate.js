const { DiscordEvent } = require("eris-boiler/lib");
module.exports = new DiscordEvent({
	name: "guildCreate",
	run: async (bot, guild) => {
		const auditLog = await guild.getAuditLogs(50, undefined, 28).catch(er=>{});
		if (!auditLog){
			bot.createMessage("790481772952813581",{
				content: "",
				embed:{
					title: "Guild Join",
					description: `Joined Guild ${guild.name} with no permissions. Total Guilds ${bot.guilds.size}`
				}
			});
			return;
		}
		for (const [one, two] of Object.entries(auditLog)) {
			for (var i = 0; i < two.length; i++) {
				var logAction = two[i];

				if (logAction.actionType == 28 && logAction.target.id === bot.user.id) {
					bot.createMessage("790481772952813581",{
						content: "",
						embed:{
							title: "Guild Join",
							description: `Joined Guild ${guild.name} invited by ${logAction.user.username}#${logAction.user.discriminator}(${logAction.user.id}). Total Guilds ${bot.guilds.size}`
						}
					});
					bot.SQLHandler.updateGuild(guild.id,{inviter: logAction.user.id});
					return;
				}
			}
		}
	}
});

