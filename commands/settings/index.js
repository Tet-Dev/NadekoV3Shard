
const { GuildCommand } = require("eris-boiler/lib");

const prefix = require("./prefix");
const mod = require("./mod");
const admin = require("./admin");
const dj = require("./dj");
const extraRole = require("./extraRole");
const extraRole2 = require("./extraRole2");
const levelRewards = require("./levelRewards");
const keeproleswhenlevel = require("./keepRolesWhenLevel");
const messageEvents = require("./messageEvents");
const betaMode = require("./betaMode");
const whoping = require("./whoping");
module.exports = new GuildCommand({
	name: "settings",
	description: "Change some settings for your server :)",
	options: {
		subCommands: [
			prefix,
			mod,
			dj,
			admin,
			extraRole,
			extraRole2,
			keeproleswhenlevel,
			levelRewards,
			messageEvents,
			betaMode,
			whoping,
		]
	},
	run: async function (bot, context) {
		return {
			embed: {
				description: ":gear: Settings",
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
