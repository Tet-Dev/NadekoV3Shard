const axios = require("axios");
const { VoiceState } = require("eris");
const { Command } = require("eris-boiler/lib");
const urbandic = require("urban-dictionary");
const botStats = require("./botStats");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
module.exports = new Command({
	name: "follow", // name of command
	description: "Follows the Dazai News Channel!",
	run: (async (client, { msg, params }) => {
		if (!await client.permissionsHandler.checkForPerm(msg.member, "admin")) return "Admin role is required to execute this command!";
		let newsChannel = await client.getRESTChannel("750977521297653790");
		try {
			await newsChannel.follow(msg.channel.id);
			return "You are now subscribed! To unsubscribe, go to Server Settings > Integrations > Channels Followed > Tet Development #dazai-updates and press unfollow!";
		} catch (error) {
			msg.channel.createMessage("Could not subscribe to the news channel!");
		}
		


	}),
	options: {
		// aliases: ["ud"],
		// parameters: ["the word or phase you wish to gain more knowledge about"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
