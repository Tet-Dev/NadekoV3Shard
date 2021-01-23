const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "shuffle", // name of command
	description: "Shuffles the playlist",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "shuffle"))) {
			return "You lack the permission `shuffle`";
		}
		try {
			let resp = await client.MusicHandler.shufflePlaylist(msg.guildID);
			if (resp) return "Music Shuffled!";
			return "Nothing Playing?";
		} catch (error) {
			return "Could not shuffle playlist!";
		}


	}),
	options:{
		// aliases: ["q"]
		// parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});