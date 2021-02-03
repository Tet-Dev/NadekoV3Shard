const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "disconnect", // name of command
	description: "Disconnects the bot.",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "forceDC"))) {
			return "You lack the permission `forceDC`";
		}
		await client.MusicHandler.stop(msg.guildID);
		return "Disconnected!";


	}),
	options:{
		aliases: ["dc"]
		// parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});