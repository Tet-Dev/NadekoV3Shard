const { GuildCommand } = require("eris-boiler/lib");
const fs = require("fs");
const { join } = require("path");
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
	name: "reload", // name of command
	description: "",
	run: (async (client, { msg, params }) => {
		if (client.botMasters.includes(msg.author.id)) {
			// let cmd = params[0];
			// if (!cmd) return "Command needed!";
			// let cmdtoReplace = client.commands.get(cmd);
			// if (!cmdtoReplace) return "could not find command!";
			// else {
			//     let cmdMod = require (`./${cmd}`);
			//     client.commands.set(cmd, cmdMod);
			//     return "Reloaded Command!";
            // }
			client.commands.clear();
			// client.events.clear();
			await client
				.addCommands(join(__dirname, "commands")); // load commands in commands folder
				// .addEvents(join(__dirname, "events")); // load events in events folder
			return "Reloaded!";
		}
		// if ()
	}),
	options: {
		hidden: true,
		// aliases: ["p"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
