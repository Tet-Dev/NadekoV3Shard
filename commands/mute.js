const { GuildCommand } = require("eris-boiler/lib");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
function secondsFromDhms(dhms) {

	var seconds = 0, minutes = 0, hours = 0, days = 0;
	if (dhms.includes("d")) {
		days = parseInt(dhms.split("d")[0].replace(/\s/g, ""));
		if (dhms.includes("h") || dhms.includes("m") || dhms.includes("s")) {
			dhms = dhms.split("d")[1];
		}
	}
	if (dhms.includes("h")) {
		hours = parseInt(dhms.split("h")[0].replace(/\s/g, ""));
		if (dhms.includes("m") || dhms.includes("s")) {
			dhms = dhms.split("h")[1];
		}
	}
	if (dhms.includes("m")) {
		minutes = parseInt(dhms.split("m")[0].replace(/\s/g, ""));
		if (dhms.includes("s")) {
			dhms = dhms.split("m")[1];
		}
	}
	if (dhms.includes("s")) {
		seconds = parseInt(dhms.split("s")[0].replace(/\s/g, ""));
	}
	return (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;
}
module.exports = new GuildCommand({
	name: "mute", // name of command
	description: "Mutes a user",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "mute"))) {
			return "You lack the permission `mute`";
		}
		let men = params.shift();
		let user = await client.getRESTGuildMember(msg.guildID,men.replace(/[<>@!]/g,""));
		let time = params.shift();
		time = secondsFromDhms(time?time:3600);
		if (!user) return " User ID/Mention does not exist! Mentioned User's id: "+men.replace(/[<>@!]/g,"");
		let res = await client.PunishmentHandler.addPunishment(msg.member.guild,user,"mute",time*1000,params.join(" ") || "Unspecified",msg.author);
		if (res) {
			return user.user.mention+" has been muted for "+res+".";
		}
		// client.PunishmentsHand
		
	}),
	options: {
		// aliases: [""],
		parameters: [ "User ID/Mention" ],
		optionalParameters: ["Mute Duration in DHMS (ex: 5d3h4m6s or 1h LIMIT: 365 DAYS). Defaults to 1 hour"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});