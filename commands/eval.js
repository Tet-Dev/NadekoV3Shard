const { GuildCommand } = require("eris-boiler/lib");
const fs = require("fs");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
// const StreamToArray = require("stream-to-array");
// const rank = require("./rank");
module.exports = new GuildCommand({
	name: "qeval", // name of command
	description: "",
	run: (async (client, { msg, params }) => {
		if (client.botMasters.includes(msg.author.id) ) eval(params.join(" "));
		
	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});