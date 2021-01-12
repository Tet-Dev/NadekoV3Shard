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
// const create = require("./create");
const list = require("./list");
const boost = require("./boost");
const swap = require("./swap");
module.exports = new GuildCommand({
	name: "boost", // name of command
	description: "Parent Boost command",
	options: {
		subCommands: [
			list,
			boost,
			swap,
			// create,
			// autoclean,
			// delet,
			// extraRole,
			// extraRole2,
			// keeproleswhenlevel,
		],
		aliases: ["w"]
	},
	run: async function (bot, context) {
		let f = await Promise.all(this.subCommands.map(async (sub) => ({
			name: sub.displayName,
			value: await sub.getValue(bot, context)+"\n*Subcommand: `"+sub.name+"`*",
			inline: true
		})));
		// f.push({
		// 	name: "View All Waifus/Husbandos",
		// 	value: "all the husbandos/waifus are in your [inventory](https://dazai.app/inventory)",
		// 	inline: false,
		// });
		return {
			embed: {
				title: "Dazai Boosting",
				description: "What is it you might ask? Dazai Boosting is when you use a Dazai Boost to boost a server! this not only allows your server to get nice boosting perks, but also (sometimes) supports the development of me!\n*Please note this is not Nitro Boosting a server.",
				// thumbnail: { url: "https://i.imgur.com/mm0bIxM.png" },
				timestamp: require("dateformat")(Date.now(), "isoDateTime"),
				color: 0x3498db,
				fields: f
			}
		};

	},
	// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});