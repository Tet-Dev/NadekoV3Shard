const axios = require("axios");
const { GuildCommand } = require("eris-boiler/lib");
const moment = require("moment");
// const Danbooru = require('danbooru');
const Booru = require("booru");
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
function parseLevelRewards(str){
	if (!str) return [];
	return str.split("||").map(x=>{
		if (!x) return null;
		let qd = x.split(",");
		return {
			level: qd[0].replace(/\|/g,""),
			roleID: qd[1],
		};
	}).filter(x=>x);
}
function stringifyLevelRewards(arr){
	return arr.map(x=>x.level+","+x.roleID).join("||");
}
const { ReactionCollector, MessageCollector } = require("eris-collector");

// const pluri
function getNextMessageForPrompt(bot,msg){
	return new Promise((res,_rej)=>{
		let msgs = new MessageCollector(bot,msg.channel,(m)=>m.author.id === msg.author.id,{max:1});
		msgs.on("collect",masg=>{
			res(masg);
		});
		setTimeout(() => {
			res("to");
		}, 300000);
	});
}
const EmbedPaginator = require("eris-pagination");
const colBlackList = ["id","queue","skippingppl","currentsonglink","queuecache","currentsonginfo", "guilddatabg", "guilddatacolor", "inviter", "premium", "loop", "punishments", "boosters","lockedGuildMemberNames","reactionroles"];
//id, queue, skippingppl, currentsonglink, queuecache, currentsonginfo, guilddatabg, guilddatacolor, inviter, levelrewards, keepRolesWhenLevel, giveRolesWhenJoin, reactionroles, premium, levelremoves, joinmsg, leavemsg, joindmmsg, levelmsgs, levelmsgchan, joinchan, leavechan, loop, punishments, boosters, prefix, modRole, adminRole, djRole, modRolePerms, djRolePerms, extraRolePerms, extraRole2Perms, extraRole2, extraRole, everyonePerms, lockedGuildMemberNames, xpCurve
//------------------------------------------------
let findRole = (guild,roleID)=>guild.roles.filter(x=>x.id === roleID)[0];
module.exports = new GuildCommand({
	name: "export", // name of command
	description: "Exports Dazai server config data into a flatfile for easy use",
	run: (async (client, { msg, params }) => {
		if (!client.SQLHandler.serverIsBeta(msg.guildID)) return "This feature is currently avalible for Beta servers only! To set your server as a beta server, set `mode` in `settings` to `beta`!";
		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "export"))) {
			return "You lack the permission `export`";
		}
		let progress = client.createMessage(msg.channel.id,"Creating Export File... ");	
		let data = await client.SQLHandler.getGuild(msg.guildID);
		colBlackList.forEach((x)=>{
			delete data[x];
		});
		let guild = await client.getRESTGuild(msg.guildID,false);
		progress = await progress;
		// progress.edit()
		data.levelrewards = await Promise.all(parseLevelRewards(data.levelrewards).map(async x=>{
			let role = findRole(guild,x.roleID);
			if (!role)
				return;
			x.rolename = role.name;
			return x;
		}));
		//levelmsgchan, joinchan, leavechan
		if (data.joinchan && data.joinchan !== "none"){
			let jchan = await client.getRESTChannel(data.joinchan).catch((_er)=>{
				msg.channel.createMessage(`Could not fetch channel id **${data.joinchan}** assuming *none* ` );
			});
			if (jchan){
				data.joinchan = jchan.name;

			}else{
				data.joinchan = "none";
			}
		}
		if (data.leavechan && data.leavechan !== "none"){
			let lchan = await client.getRESTChannel(data.leavechan).catch((_er)=>{
				msg.channel.createMessage(`Could not fetch channel id **${data.leavechan}** assuming *none* ` );
			});
			if (lchan){
				data.leavechan = lchan.name;

			}else{
				data.leavechan = "none";
			}
		}
		if (data.levelmsgchan && data.levelmsgchan !== "none"){
			let lvchan = await client.getRESTChannel(data.levelmsgchan).catch((_er)=>{
				msg.channel.createMessage(`Could not fetch channel id **${data.levelmsgchan}** assuming *none* ` );
			});
			if (lvchan){
				data.levelmsgchan = lvchan.name;

			}else{
				data.levelmsgchan = "none";
			}
		}
		data.levelremoves = await Promise.all(parseLevelRewards(data.levelremoves).map(async x=>{
			let role = guild.roles.filter(x=>x.id)[0];
			if (!role)
				return;
			x.rolename = role.name;
			return x;
		}));
		// modRole, adminRole, djRole, modRolePerms, djRolePerms, extraRolePerms, extraRole2Perms, extraRole2, extraRole, everyonePerms
		let mr = findRole(guild,data.modRole);
		if (!mr) msg.channel.createMessage(`Could not find Mod Role with ID ${data.modRole}! Assuming \`null\``)
		data.modRole = mr? mr.name : null;
		let ar = findRole(guild,data.adminRole);
		if (!ar) msg.channel.createMessage(`Could not find Admin Role with ID ${data.adminRole}! Assuming \`null\``)
		data.adminRole = ar? ar.name : null;
		let djr = findRole(guild,data.djRole);
		if (!djr) msg.channel.createMessage(`Could not find DJ Role with ID ${data.djRole}! Assuming \`null\``)
		data.djRole = djr? djr.name : null;
		let er = findRole(guild,data.extraRole);
		if (!er) msg.channel.createMessage(`Could not find Extra Role with ID ${data.extraRole}! Assuming \`null\``)
		data.extraRole = er? er.name : null;
		let er2 = findRole(guild,data.extraRole2);
		if (!er2) msg.channel.createMessage(`Could not find Extra Role with ID ${data.extraRole2}! Assuming \`null\``)
		data.extraRole2 = er2? er2.name : null;
		msg.channel.createMessage("Export Finished!",{
			file:new Buffer(JSON.stringify(data)),
			name: `${guild.name}.Dazai`
		});
	}),
	options: {
		// aliases: ["editsnipe"]
		// optionalParameters: ["number of messages to"]
		// parameters: [],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
