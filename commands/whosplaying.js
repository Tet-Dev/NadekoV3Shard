const { GuildCommand } = require("eris-boiler/lib");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str,len){
	let array = str.split("");
	array.length = len-3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "whosplaying", // name of command
	description: "Admin Command.",
	run: (async (client, { msg, params }) => {
		if (!client.botMasters.includes(msg.author.id) ) return;
		return "Admin command: There are "+client.voiceConnections.size;

	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	 // functionality of command
		// aliases: 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});