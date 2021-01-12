// const axios = require("axios");
const { GuildCommand } = require("eris-boiler/lib");
// const moment = require("moment");
// const Danbooru = require('danbooru');
// const Booru = require("booru");
const requestAPI = require("request");
const fs = require("fs");
const fsp = fs.promises;
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
function parseLevelRewards(str) {
	if (!str) return [];
	return str.split("||").map(x => {
		if (!x) return null;
		let qd = x.split(",");
		return {
			level: qd[0].replace(/\|/g, ""),
			roleID: qd[1],
		};
	}).filter(x => x);
}
function stringifyLevelRewards(arr) {
	return arr.map(x => x.level + "," + x.roleID).join("||");
}
const { MessageCollector } = require("eris-collector");
function download(url, path) {
	return new Promise((reso, rej) => {
		requestAPI.head(url, (err, res, body) => {
			requestAPI(url)
				.pipe(fs.createWriteStream(path))
				.on("close", () => { reso(path); });
		});
	});

}
// const pluri
function getNextMessageForPrompt(bot, msg) {
	return new Promise((res, _rej) => {
		let msgs = new MessageCollector(bot, msg.channel, (m) => m.author.id === msg.author.id, { max: 1 });
		msgs.on("collect", masg => {
			res(masg);
		});
		setTimeout(() => {
			res("to");
		}, 300000);
	});
}
function genID(length) {
	let result = "";
	let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
const EmbedPaginator = require("eris-pagination");
const colBlackList = ["id", "queue", "skippingppl", "currentsonglink", "queuecache", "currentsonginfo", "guilddatabg", "guilddatacolor", "inviter", "premium", "loop", "punishments", "boosters", "lockedGuildMemberNames", "reactionroles"];
//id, queue, skippingppl, currentsonglink, queuecache, currentsonginfo, guilddatabg, guilddatacolor, inviter, levelrewards, keepRolesWhenLevel, giveRolesWhenJoin, reactionroles, premium, levelremoves, joinmsg, leavemsg, joindmmsg, levelmsgs, levelmsgchan, joinchan, leavechan, loop, punishments, boosters, prefix, modRole, adminRole, djRole, modRolePerms, djRolePerms, extraRolePerms, extraRole2Perms, extraRole2, extraRole, everyonePerms, lockedGuildMemberNames, xpCurve
//------------------------------------------------
let findRole = (guild, roleID) => guild.roles.filter(x => x.id === roleID)[0];
let findRoleByName = (guild, name) => guild.roles.filter(x => x.name === name)[0];
module.exports = new GuildCommand({
	name: "import", // name of command
	description: "Imports Dazai server config data from a flatfile WILL OVERRIDE SETTINGS",
	run: (async (client, { msg, params }) => {
		if (! await client.SQLHandler.serverIsBeta(msg.guildID)) return "This feature is currently avalible for Beta servers only! To set your server as a beta server, set `mode` in `settings` to `beta`!";
		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "import"))) {
			return "You lack the permission `import`";
		}
		await msg.channel.createMessage("Importing will override Data! Are you 100% sure? Type `yes` to confirm. Anything else to cancel");
		let guild = client.getRESTGuild(msg.guildID, false);
		let resp = await getNextMessageForPrompt(client, msg);
		if (resp.content && resp.content !== "yes") return "Operation `import` cancelled.";

		let progress = client.createMessage(msg.channel.id, "Fetching Import Data... ");
		let link = (msg.attachments.length) ? msg.attachments[0].url : link;
		if (!link) {
			return "No file attached or emote mentioned!";
		}
		let dir = `${genID(25)}.dazai`;
		guild = await guild;
		// if (!guild.permissionsOf(client.user.id).has("manageRoles") || !guild.permissionsOf(client.user.id).has("manageChannels")) return "I need more permissions! (Manage Channels and Manage Roles)";
		let data = await fsp.readFile(await download(link, dir));
		try {
			data = JSON.parse(data);
		} catch (error) {
			return "Error reading file! The file has been damaged/corrupted.";
		}
		
		// progress.edit()
		data.levelrewards = await Promise.all(data.levelrewards.map(async (x) => {
			let role = findRoleByName(guild, x.rolename);
			if (!role)
				role = await guild.createRole( {
					name: x.rolename,
				},"Data Import");
			x.roleID = role.id;
			return x;
		}));
		// console.log(msgmember.guild.channels.filter(x=>x));
		data.levelrewards = stringifyLevelRewards(data.levelrewards.filter(x=>x));
		if (data.joinchan && data.joinchan !== "none") {
			let chan = msg.member.guild.channels.filter(x=>x.name === data.joinchan)[0];
			if (!chan)
				chan = await client.createChannel(guild.id,data.joinchan);
			data.joinchan = chan.id;
		}
		if (data.leavechan && data.leavechan !== "none") {
			let chan = msg.member.guild.channels.filter(x=>x.name === data.leavechan)[0];
			if (!chan)
				chan = await client.createChannel(guild.id,data.leavechan);
			data.leavechan = chan.id;
		}
		if (data.levelmsgchan && data.levelmsgchan !== "none") {
			let chan = msg.member.guild.channels.filter(x=>x.name === data.levelmsgchan)[0];
			if (!chan)
				chan = await client.createChannel(guild.id,data.levelmsgchan);
			data.levelmsgchan = chan.id;
		}
		data.levelremoves = await Promise.all((data.levelremoves).map(async x => {
			let role = findRoleByName(guild, x.rolename);
			if (!role) return false;
			x.roleID = role.id;
			return x;
		}));
		data.levelremoves = stringifyLevelRewards(data.levelremoves.filter(x=>x));
		// modRole, adminRole, djRole, modRolePerms, djRolePerms, extraRolePerms, extraRole2Perms, extraRole2, extraRole, everyonePerms
		let mr = findRoleByName(guild, data.modRole);
		if (!mr) msg.channel.createMessage(`Could not find Mod Role with ID ${data.modRole}! Assuming \`null\``);
		data.modRole = mr ? mr.id : null;
		let ar = findRoleByName(guild, data.adminRole);
		if (!ar) msg.channel.createMessage(`Could not find Admin Role with ID ${data.adminRole}! Assuming \`null\``);
		data.adminRole = ar ? ar.id : null;
		let djr = findRoleByName(guild, data.djRole);
		if (!djr) msg.channel.createMessage(`Could not find DJ Role with ID ${data.djRole}! Assuming \`null\``);
		data.djRole = djr ? djr.id : null;
		let er = findRoleByName(guild, data.extraRole);
		if (!er) msg.channel.createMessage(`Could not find Extra Role with ID ${data.extraRole}! Assuming \`null\``);
		data.extraRole = er ? er.id : null;
		let er2 = findRoleByName(guild, data.extraRole2);
		if (!er2) msg.channel.createMessage(`Could not find Extra Role with ID ${data.extraRole2}! Assuming \`null\``);
		data.extraRole2 = er2 ? er2.id : null;
		await client.SQLHandler.updateGuild(guild.id,data);
		fs.unlink(dir,()=>{});
		return `Import Done! New Prefix \`\`\`${data.prefix || "daz"}\`\`\``;
		// msg.channel.createMessage("Export Finished!", {
		// 	file: new Buffer(JSON.stringify(data)),
		// 	name: `${guild.name}.Dazai`
		// });
	}),
	options: {
		// aliases: ["editsnipe"]
		// optionalParameters: ["number of messages to"]
		// parameters: [],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
