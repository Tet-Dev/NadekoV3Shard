const { GuildCommand } = require("eris-boiler/lib");
const pay = require('./pay');
const bal = require('./bal');
module.exports = new GuildCommand({
	name: "eco", // name of command
	description: "The Parent of all economy Commands",
	options: {
		subCommands: [
			// prefix,
			pay,
			bal,
			// dj,
			// extraRole,
			// extraRole2,
			// keeproleswhenlevel,
		],
		aliases: ["economy"]
	},
	run: async function (bot, context) {
		let f = await Promise.all(this.subCommands.map(async (sub) => ({
			name: sub.displayName,
			value: await sub.getValue(bot, context)+"\n*Subcommand: `"+sub.name+"`*",
			inline: true
		})));
		f.push({
			name: "Shop",
			value: "go to [The Shop](https://dazai.app/self/) to check out my daily deals for you!",
			inline:true
		});
		f.push({
			name: "Inventory",
			value: "Go to [Inventory](https://dazai.app/inventory/)",
			inline:true
		});
		return {
			embed: {
				title: "Economy :moneybag:",
				description: "The Parent of all economy Commands",
				thumbnail: { url: "https://i.imgur.com/zuWutlN.png" },
				timestamp: require("dateformat")(Date.now(), "isoDateTime"),
				color: 0x3498db,
				fields: f
			}
		};
	}
	// options:{
	// 	aliases: ["q"]
	// }
});