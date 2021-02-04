const { SettingCommand } = require("eris-boiler/lib");

module.exports = new SettingCommand({
	name: "whoping",
	description: "set whether or not whoping is on",
	options: {
		parameters: ["on / off"]
	},
	displayName: "Who Ping",
	getValue: async (bot, { channel }) => {
		const prefix = await bot.SQLHandler.getGuild(channel.guild.id);
		return (prefix.whoping? "On": "Off");
	},
	run: async (bot, { msg, params }) => {
		if (!await bot.permissionsHandler.checkForPerm(msg.member, "admin")) return "Admin role is required to execute this command!";
		const fullParam = params.join(" ");
		if (!fullParam) {
			return "Missing either `yes` or `no` !";
		}
		let set = 1;
		if (fullParam.toLowerCase() === "yes") {
			set = 1;
		} else if (fullParam.toLowerCase() === "no") {
			set = 0;
		} else {
			return "Missing either `yes` or `no` !";
		}
		const guildData = await bot.SQLHandler.getGuild(msg.guildID);
		if (set === guildData.whoping) {
			return `Who ping is already ${set ? "ON" : "OFF"}`;
		}

		await bot.SQLHandler.updateGuild(msg.guildID, { whoping: set });
		return "Who ping set!";

	}
});
