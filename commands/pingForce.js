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
const { default: Axios } = require("axios");
// const StreamToArray = require("stream-to-array");
// const rank = require("./rank");
module.exports = new GuildCommand({
	name: "forceping", // name of command
	description: "Force Pings the centeral node",
	run: (async (client, { msg, params }) => {
		if (client.botMasters.includes(msg.author.id) ){
			const commandsBlacklist = ["eval", "reboot"];
			let commands = [];

			Array.from(client.commands.keys()).forEach((item) => {
				if (commandsBlacklist.includes(item)) {
					return;
				}
				// if (client.commands[item].hidden) {
				// 	return;
				// }
				let it = client.commands.get(item);
				if (it.hidden) return;
				let usage = it.parameters && it.parameters.length ? `daz ${item} <code>{${it.parameters.join("}  {")}} ${it.optionalParameters && it.optionalParameters.length ? `[${it.optionalParameters.join("]  [")}]` : ""} </code>` : (it.optionalParameters && it.optionalParameters.length ? `daz ${item} <code>[${it.optionalParameters.join("]  [")}]</code>` : `daz ${item}`);
				let mod = 0;
				// while (usage.search(/```/g) != -1) {

				// 	usage = (mod % 2 == 0 ? usage.replace("```", "<br><code>") : usage.replace("```", "</code>"));
				// 	mod++;
				// }
				commands.push({
					name: item,
					description: it.description,
					usage: usage
				});
				if (!it.subCommands || Array.from(it.subCommands.keys()).length == 0) return;
				Array.from(it.subCommands.keys()).forEach((key) => {
					let subit = it.subCommands.get(key);
					usage = subit.parameters && subit.parameters.length ? `daz ${item} ${key} <code>{${subit.parameters.join("}  {")}} ${subit.optionalParameters && subit.optionalParameters.length ? `[${subit.optionalParameters.join("]  [")}]` : ""}</code>` : (subit.optionalParameters && subit.optionalParameters.length ? `daz ${item} <code>[${subit.optionalParameters.join("]  [")}]</code>` : `daz ${item} ${key}`);
					commands.push({
						name: `${item} ${key}`,
						description: subit.description,
						usage: usage
					});
				});

			});
			Axios.post("https://api.dazai.app/api/reportShard",{
				token : client.token,
				guildCount: client.guilds.size,
				commands: commands,
				perms: client.permissionsHandler.getallPerms(),
				shard: process.env.PROCESSID,
			});
		}
		
	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});