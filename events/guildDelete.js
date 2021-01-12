const { DiscordEvent } = require("eris-boiler/lib");
module.exports = new DiscordEvent({
	name: "guildDelete",
	run: async (bot, guild) => {
		bot.createMessage("790481772952813581", {
			content: "",
			embed: {
				title: "Guild Leave",
				description: `Left Guild ${guild.name || "Unknown Name! ID: " + guild.id}. Total Guilds ${bot.guilds.size}`
			}
		});
		return;
	}
});

