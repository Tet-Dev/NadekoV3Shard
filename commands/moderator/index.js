
const { GuildCommand } = require("eris-boiler/lib");

const prefix = require("./prefix");
const mod = require("./mod");
const list = require("../list;
const dj = require("./dj");
const extraRole = require("./extraRole");
const extraRole2 = require("./extraRole2");
const levelRewards = require("./levelRewards");
const keeproleswhenlevel = require("./keepRolesWhenLevel");
const messageEvents = require("./messageEvents");
const betaMode = require("./betaMode");
module.exports = new GuildCommand({
	name: "moderator",
	description: "Change some settings for the server moderator :)",
	options: {
		subCommands: [
			prefix,
			mod,
			dj,
			admin,
			list,
			extraRole2,
			keeproleswhenlevel,
			levelRewards,
			messageEvents,
			betaMode,
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
