const axios = require("axios");
const moment = require("moment");
// const Danbooru = require('danbooru');
const Booru = require('booru');
const { meanBy } = require("lodash");
const { GuildCommand } = require("eris-boiler");
// const booru = new Danbooru();
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
function shuffleArray(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
module.exports = new GuildCommand({
	name: "warn", // name of command
	description: "Warns a user.",
	run: (async (client, { msg, params }) => {

		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "warnUser"))) {
			return "You lack the permission `warnUser`";
		}
		let member = await client.getRESTGuildMember(msg.guildID,params.shift().match(/\d+/g)).catch(er=>{});
		if (!member)
			return `I cannot find that member!`;
		let reason = params.join(" ");
		client.PunishmentHandler.addPunishment(member.guild,member,"warn",null,reason || "Unspecified",msg.member);
		return "Warned user!";
	}),
	options: {
		// aliases: ["nh"]
		optionalParameters: ["Reason for the warn"],
		parameters: ["User ID / Mention"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
