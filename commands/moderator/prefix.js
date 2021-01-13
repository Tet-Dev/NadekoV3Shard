const { SettingCommand } = require("eris-boiler/lib");

module.exports = new SettingCommand({
	name: "prefix",
	description: "set prefix for server",
	options: {
		parameters: [ "desired prefix" ]
	},
	displayName: "Prefix",
	getValue: async (bot, { channel }) => {
		const prefix = await bot.SQLHandler.getGuild(channel.guild.id);
		return (prefix.prefix || bot.ora.defaultPrefix);
	},
	run: async (bot, { msg, params }) => {
		if (!await bot.permissionsHandler.checkForPerm(msg.member,"admin")) return "Admin role is required to execute this command!";
		const fullParam = params.join(" ");
		if (!fullParam) {
			return "Please provide a prefix!";
		}

		const guildData = await bot.SQLHandler.getGuild(msg.guildID);
		if (fullParam === guildData.prefix) {
			return `Prefix is already set to "${fullParam}"`;
		}

		await bot.SQLHandler.updateGuild(msg.guildID,{ prefix: fullParam });
		return "Prefix set!";
	}
});
