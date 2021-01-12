const { GuildCommand } = require("eris-boiler/lib");
const EmbedPaginator = require("eris-pagination");
module.exports = new GuildCommand({
	name: "queue", // name of command
	description: "Displays the current queue SLASH COMMAND WILL NOT WORK WITH THIS!",
	run: (async (client, { msg, params }) => {
	}),
	options: {
		aliases: ["q"]
	}
});