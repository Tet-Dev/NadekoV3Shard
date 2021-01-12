const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str,len){
	let array = str.split("");
	array.length = len-3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "voteskip", // name of command
	description: "Votes to skip the current song SLASH COMMAND WILL NOT WORK WITH THIS!",
	run: (async (client, { msg, params }) => {
	}),
	options:{
		aliases: ["vs","skip"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});