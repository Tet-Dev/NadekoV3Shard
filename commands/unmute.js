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
	name: "unmute", // name of command
	description: "unmutes a user",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "unmute"))) {
			return "You lack the permission `unmute`";
		}
		let men = params.shift();
		let user = await client.getRESTGuildMember(msg.guildID, men.replace(/[<>@!]/g, ""));
		// let time = secondsFromDhms(params.shift());
		let guild = msg.member.guild;
		if (!user) return " User ID/Mention does not exist! Mentioned User's id: " + men.replace(/[<>@!]/g, "");
		let mutedRoles = guild.roles.filter(x => x.name === "Muted");
		mutedRoles.sort((a, b) => b.position - a.position);
		let mutedRole = mutedRoles[0];
		if (!mutedRole) {
			let botmem = await client.getRESTGuildMember(guild.id, client.user.id);
			let botRoles = guild.roles.filter(x => botmem.roles.includes(x.id));
			botRoles.sort((a, b) => b.position - a.position);
			let newRole = await client.createRole(guild.id, {
				name: "Muted",
				permissions: 0,
				mentionable: false,
			});
			await newRole.editPosition(botRoles[0].position > 0 ? botRoles[0].position - 1 : 0);
			mutedRole = newRole;
		}
		await user.removeRole(mutedRole.id,"Unmuted by "+msg.author.username+"#"+msg.author.discriminator);
		return "Unmuted!";
		// client.PunishmentsHand

	}),
	options: {
		// aliases: [""],
		parameters: ["User ID/Mention"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});