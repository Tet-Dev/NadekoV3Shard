const axios = require("axios");
const { Command } = require("eris-boiler/lib");
const urbandic = require("urban-dictionary");
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
//------------------------------------------------
module.exports = new Command({
	name: "urban", // name of command
	description: "(NSFW) Provides the urban dictionary definition of a word",
	run: (async (client, { msg, params }) => {
		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "urban"))) {
			return "You lack the permission `urban`";
		}
		if (!msg.channel.nsfw && msg.member) return "You need to perform this command either in a dm or in a NSFW Text Channel!";
		let result =await urbandic.term(params.join(" ")).catch(()=>msg.channel.createMessage("I can't find that term!"));
		let entries = result.entries;
		if (!entries) return "I cant find that term!";
		let entry = entries[0];
		if (!entry) return "I cant find that term!";
		// entries.length = 3;
		// // let f = entries.map(x=>{
			
		// // 	return {
		// // 		name: `*${x.word}*`,
		// // 		value: `\`\`\`${text_truncate(x.definition,900)}\`\`\`\n*${text_truncate(x.example,100)}*`,
		// // 		inline:false,
		// // 	};
		// // });

		// return `\`\`\`${entry.example}\`\`\``
		return {
			embed:
			{
				"title": entry.word,
				"description": `\`\`\`${entry.definition.replace(/\[/g,"").replace(/\]/g,"")}\`\`\`\n*${entry.example.replace(/\[/g,"").replace(/\]/g,"")}*\n\n"`,
				"color": 0,
				// "fields": f,
				"thumbnail": {
					"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/UD_logo-01.svg/500px-UD_logo-01.svg.png"
				}
			}

		};

	}),
	options: {
		aliases: ["ud"],
		parameters: ["the word or phase you wish to gain more knowledge about"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
