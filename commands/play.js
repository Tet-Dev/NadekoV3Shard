const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
const { ReactionCollector, MessageCollector } = require("eris-collector");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
function getChoice(client,msg, userid) {
	return new Promise(async (res, rej) => {
		let filter = (m, emoji, userID) => userID === userid;

		/* Create collector */
		let collector = new ReactionCollector(client, msg, filter, {
			time: 1000 * 60
		});

		/* 
		 * Emitted when collector collects something suitable for filter 
		 * For more information, please see discord.js docs: https://discord.js.org/#/docs/main/stable/class/ReactionCollector
		*/
		collector.on("collect", (m, emoji, userID) => {
			res(emoji);
		});
		setTimeout(() => {
			msg.delete();
			res(null);
		}, 60000);
	});
}
module.exports = new GuildCommand({
	name: "play", // name of command
	description: "Plays music. SLASH COMMAND WILL NOT WORK WITH THIS!",
	run: (async (client, { msg, params }) => {
	}),
	options: {
		aliases: ["p"],
		parameters: ["Song Youtube Link / Spotify Playlist / Youtube Playlist / Song Name"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});