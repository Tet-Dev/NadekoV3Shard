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
function getUrban(term){
	
}
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
function getSimps(bot){
	return bot.simps;
}
//------------------------------------------------
module.exports = new Command({
	name: "credits", // name of command
	description: "List of credits",
	run: (async (client, { msg, params }) => {
		let simps = await getSimps(client);
		return {
			embed:
			{
				"title": "Credits/Acknowledgements",
				"description": `__Acknowledgements__
				**Made with [eris-boiler](https://github.com/alex-taxiera/eris-boiler)
				Some image assets from [icons8](http://icons8.com)
				Developed by Degenetet#0001**

				Supporters:
				${simps.join("\n")}
				`,
				"color": 0,
				// "fields": f,
				"thumbnail": {
					"url": client.user.dynamicAvatarURL("png", 256)

				}
			}

		};

	}),
	options: {
		// aliases: ["ud"],
		// parameters: ["the word or phase you wish to gain more knowledge about"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
