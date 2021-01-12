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
const StreamToArray = require("stream-to-array");
const rank = require("./rank");
module.exports = new GuildCommand({
	name: "top", // name of command
	description: "Displays the people who hold the most XP!!",
	run: (async (client, { msg, params }) => {
		// let waitM = await client.createMessage()
		let lbData = await client.LevellingHandler.getLB(msg.author.id, msg.guildID);

		let ranking = lbData.ranked.map((x, ind) => {
			if (ind == 0) {
				return "🥇 ꧁༒☬ <@!" + x.id + "> ☬༒꧂ | Level **" + x.level + "**\n";
			}
			else if (ind == 1) {
				return "🥈 ☬ <@!" + x.id + "> ☬ | Level **" + x.level + "** \n";
			}
			else if (ind == 2) {
				return "🥉 <@!" + x.id + "> | Level *" + x.level + "*\n";
			}
			else {
				return "<@!" + x.id + "> | Level " + x.level;
			}
			//🥈🥉
		});

		if (ranking.length > 10 ) ranking.length = 10;
		// ranking.push("You are Currently  #"+lbData.pos);
		return {
			embed: {
				title: "XP Leaderboard",
				description: ranking.join("\n"),
				footer: {
					"text": "You are currently #"+lbData.pos+"!"
				},
			}
		};
	}),
	options: {
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});