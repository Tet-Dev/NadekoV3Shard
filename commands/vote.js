// const { GuildCommand } = require("eris-boiler");
const { Command } = require("eris-boiler/lib");

module.exports = new Command({
	name: "vote", // name of command
	description: "Responds with vote link",
	run: (async (client, { msg, params }) => {
		client.createMessage(msg.channel.id, "https://vote.dazai.app");

	}) // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});