const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "remove", // name of command
	description: "Removes a song based on the index or \"all\" to purge the queue SLASH COMMAND WILL NOT WORK WITH THIS!",
	run: (async (client, { msg, params }) => {
	}),
	options:{
		// aliases: ["q"]
		parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});