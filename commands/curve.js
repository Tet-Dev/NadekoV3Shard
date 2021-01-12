const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
const moment = require("moment");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "curve", // name of command
	description: "Displays current exp curve. to change the curve, type `curve set {newCurve}` (requires `setCurve`)",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "viewCurve"))) {
			return "You lack the permission `viewCurve`";
		}
		let c = await client.LevellingHandler.getUserCurve(msg.author.id, msg.guildID);
		let g = await client.SQLHandler.getGuild(msg.guildID);
		if (c.timeStarted + 86400 < (Date.now() / 1000)) {
			c.timeStarted = Math.round(Date.now() / 1000);
			c.currentlevelcurve = 0;
		}
		if (params.length == 2) {
			if (!(await client.permissionsHandler.checkForPerm(msg.member, "setCurve"))) {
				return "You lack the permission `setCurve`";
			} if (isNaN(params[1] % 1)) {
				return "Not a number!";
			}
			let split = params[1].split(".");
			

			await client.SQLHandler.updateGuild(msg.guildID, { xpCurve: params[1] });
			g = await client.SQLHandler.getGuild(msg.guildID);
			return `XP Curve Updated to \`${g.xpCurve}\``;

		}
		return `Your current guild has XP curving of \`${g.xpCurve}\` while it has curved \`${c.currentlevelcurve}\` times for you. This means that you only get \`~${Math.floor((g.xpCurve ** c.currentlevelcurve) * 10000) / 100}%\` of XP per message compared to the usual/max. This curving resets in \`${moment.duration(Math.floor(c.timeStarted + 86400 - (Date.now() / 1000)), "seconds").humanize()}\`\n*Want to change the curve? do \`curve set NEWCURVE\` to change the curve.\`setCurve\` permission required`;


	}),
	options: {
		// aliases: ["p"],
		optionalParameters: ["set", "New XP Curve"]
		// parameters: ["Song Youtube Link / Spotify Playlist / Youtube Playlist / Song Name"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});