const { SettingCommand } = require("eris-boiler/lib");

module.exports = new SettingCommand({
	name: "dj",
	description: "Set the DJ Permissions Role for the server",
	options: {
		parameters: [ "DJ Permissions Role name/id/mention" ],
	},
	displayName: "DJ Permissions Role",
	getValue: async (bot, { channel }) => {
		const dbGuild = await bot.SQLHandler.getGuild(channel.guild.id);
		const roleId = dbGuild.djRole;

		if (!roleId) {
			return "None";
		}

		return `<@&${roleId}>`;
	},
	run: async (bot, { msg, params }) => {
		if (!await bot.permissionsHandler.checkForPerm(msg.member,"admin")) return "Admin role is required to execute this command!";
		const [ roleId ] = params;
		const fullParam = params.join(" ");

		const guild = msg.channel.guild;
		const role = guild.roles.get(roleId) || guild.roles.find((r) => r.name === fullParam || (fullParam.includes("<@&") && r.id === (fullParam.split("<@&")[1].split(">")[0])));

		if (!role) {
			return `Could not find role "${fullParam}"`;
		}

		const dbGuild = await bot.SQLHandler.getGuild(msg.guildID);
		if (role.id === dbGuild.djRole) {
			return "DJ Permissions Role is already set to that role!";
		}

		await bot.SQLHandler.updateGuild(msg.guildID,{ djRole: role.id });
		return "DJ Permissions Role set!";
	}
});
