const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "resume", // name of command
	description: "Resumes music when paused.",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "resumeMusic"))) {
			return "You lack the permission `resumeMusic`";
		}
		try {
			let resp = await client.MusicHandler.resume(msg.guildID);
			if (resp) return "Music resumed!";
			else return "The music wasn't paused?";	
		} catch (error) {
			return "Nothing playing?";
		}


	}),
	options:{
		// aliases: ["q"]
		// parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});