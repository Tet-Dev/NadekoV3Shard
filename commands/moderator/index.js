
const { GuildCommand } = require("eris-boiler/lib");

const list = require("./list");
const setup = require("./setup");
module.exports = new GuildCommand({
	name: "moderator",
	description: "Change some settings for the server moderator :)",
	options: {
		subCommands: [
			list,
			setup
		]
	},
	run: async function (bot, context) {
		return {
			embed: {
				description: ":gear: Dazai Moderator",
				thumbnail: { url: bot.user.avatarURL },
				timestamp: require("dateformat")(Date.now(), "isoDateTime"),
				color: 0x3498db,
				fields: await Promise.all(this.subCommands.map(async (sub) => ({
					name: sub.displayName,
					value: await sub.getValue(bot, context) +"\n*Subcommand: `"+sub.name+"`*",
					inline: true
				})))
			}
		};
	}
});
