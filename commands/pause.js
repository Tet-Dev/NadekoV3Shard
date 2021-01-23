const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "pause", // name of command
	description: "Pauses music.",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "pauseMusic"))) {
			return "You lack the permission `pauseMusic`";
		}
		try {
			let resp = await client.MusicHandler.pause(msg.guildID);
			if (resp) return "Music paused!";
			else return "The music was already paused?";
		} catch (error) {
			return "Nothing is playing...";
		}
	}),
	options: {
		// aliases: ["q"]
		// parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});