
const { GuildCommand } = require("eris-boiler/lib");

// const prefix = require('./prefix')
const mod = require("./mod");
const everyone = require("./everyone");
const dj = require("./dj");
const extraRole = require("./extraRole");
const extraRole2 = require("./extraRole2");
// const list = require("./list");
// const keeproleswhenlevel = require("./keepRolesWhenLevel");
module.exports = new GuildCommand({
	name: "permissions",
	description: "Change some permissions for your server :)",
	options: {
		subCommands: [
			// prefix,
			everyone,
			mod,
			dj,
			extraRole,
			extraRole2,
			// list,
			// keeproleswhenlevel,
		],
		aliases: ["perms"]
	},
	run: async function (bot, context) {
		let f = await Promise.all(this.subCommands.map(async (sub) => ({
			name: sub.displayName,
			value: await sub.getValue(bot, context)+"\n*Subcommand: `"+sub.name+"`*",
			inline: true
		})));
		f.push({
			name: "View all Permissions",
			value: "[Click Me To View A List Of All Possible Permission Nodes]("
		});
		return {
			embed: {
				title: "Permissions :tools:",
				description: "Permissions are Inherited in the following order:```Base -> DJ -> ExtraRole -> ModRole -> ExtraRole2 -> Admin (Will have all perms)``` **Example**: a user with `ModRole` will also gain the permissions from `ExtraRole,DJ,Base`\n\
        Valid Sub-Commands `dj, mod, everyone, extraRole, extraRole2`\nTo set the permissions of a role, do `PREFIX perms ROLENAME PERMISSIONS`(ex: daz perms everyone dc,playSong,viewWarns)",
				thumbnail: { url: bot.user.avatarURL },
				timestamp: require("dateformat")(Date.now(), "isoDateTime"),
				color: 0x3498db,
				fields: f
			}
		};
	}
});
