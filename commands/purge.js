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
	name: "purge", // name of command
	description: "Purges X messages",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "purge"))) {
			return "You lack the permission `purge`";
		}
		if (!params[0]) return "You need to specify how many messages to purge!";
		// let allMsgs = msg.channel.getMessages(params[0]>512? 512: params[0]);
		// let purgable = allMsgs.filter(x=>);
		let resmsg = await msg.channel.createMessage("Purged "+(await msg.channel.purge(params[0]>512? 512: params[0],(msg=>Date.now()-msg.createdAt < 1209600000),null,null,`Purge by ${msg.author.username}#${msg.author.discriminator}`))+" messages!");
		await sleep(5000);
		resmsg.delete();
		// client.PunishmentsHand
		
	}),
	options: {
		aliases: ["clean","nuke"],
		parameters: [ "Amount of messages to purge. Max 512" ],
		// optionalParameters: ["Mute Duration in DHMS (ex: 5d3h4m6s or 1h LIMIT: 365 DAYS). Defaults to 1 hour"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});