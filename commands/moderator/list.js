const { SettingCommand } = require("eris-boiler/lib");
let allKeys = ["TOXICITY", "SEVERE_TOXICITY", "IDENTITY_ATTACK", "INSULT", "PROFANITY", "THREAT", "SEXUALLY_EXPLICIT", "FLIRTATION",];
module.exports = new SettingCommand({
	name: "list",
	description: "lists the current channels moderated",
	options: {
		// parameters: ["Admin Permissions Role name/id/mention"],
	},
	displayName: "List all Moderated Channels",
	getValue: async (bot, { channel }) => {
		let dbGuild = await bot.SQLHandler.query(`SELECT * FROM nadekoguilddata.channeldata WHERE parentGuild= "${channel.guild.id}"`);
		dbGuild = dbGuild.filter(x => {
			for (let i = 0; i < allKeys.length; i++) {
				if (dbGuild[allKeys[i]]) return true;
			}
			return false;
		})
		if (!dbGuild || !dbGuild.length) {
			return "Not set up!";
		}

		return `Moderating **${dbGuild.length}** channels`;
	},
	run: async (bot, { msg, params }) => {
		if (!await bot.permissionsHandler.checkForPerm(msg.member, "admin")) return "Admin role is required to execute this command!";
		// if (msg.member.guild.ownerID !== msg.author.id) return "You must be the Owner of the server to run this command!";
		let dbGuild = await bot.SQLHandler.query(`SELECT * FROM nadekoguilddata.channeldata WHERE parentGuild= "${msg.channel.guild.id}"`);
		let dbChan = await bot.SQLHandler.getChannel(msg.channel.id);

		dbGuild = dbGuild.filter(x => {
			for (let i = 0; i < allKeys.length; i++) {
				if (dbGuild[allKeys[i]]) return true;
			}
			return false;
		});
		msg.channel.createMessage({
			embed: {
				title: `AI Moderation stats for ${msg.channel}`,
				fields: allKeys.map(x => {
					return {
						name: x,
						value: `Sensitivity(0 to 100) ${dbChan[x]}`,
						inline: false,
					};
				})
			}
		});
		msg.channel.createMessage({
			embed:{
				description: `Other Channels:
				${dbGuild.map(x=>"<#"+x.id+">").join("\n")}`
			}
		});
	}
});
