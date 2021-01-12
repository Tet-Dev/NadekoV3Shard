const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "loop", // name of command
	description: "Toggles loop on or off",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "loop"))) {
			return "You lack the permission `loop`";
		}
		let channelID = msg.member.voiceState.channelID;
		if (channelID) {
			let a = client.MusicHandler.toggleLoop(msg.guildID);
			return `Looping Playlist is now \`${a? "ON":"OFF"}\``;
		} else {
			return "You are not in a vc!";
		}
		// client.createMessage(msg.channel.id, "Pong!");
		

	}),
	options: {
		// aliases: ["p"],
		// parameters: ["Song Youtube Link / Spotify Playlist / Youtube Playlist / Song Name"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});