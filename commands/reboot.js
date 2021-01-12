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
module.exports = new GuildCommand({
	name: "reboot", // name of command
	description: "Displays the people who hold the most XP!!",
	run: (async (client, { msg, params }) => {
		if (msg.author.id === "295391243318591490") process.exit(0);
		
	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});