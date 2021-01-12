const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
const fs = require("fs");
// const { boltzmannDependencies } = require("mathjs");
// const { nuclearMagnetonDependencies } = require("mathjs");
// const { logger } = require("../util");
let uwuSpeakCache = new Map();
// nicknameWindo
// async function checkIfValid(){

// }
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
function parseLevelRewards(str){
	return str.split("||").map(x=>{
		if (!x) return null;
		let qd = x.split(",");
		return {
			level: qd[0],
			roleID: qd[1],
		};
	}).filter(x=>x);
}
const cooldownMaps = new Map();
const faces = ["(・`ω´・)", ";;w;;", "owo", "UwU", ">w<", "^w^"];
const httpRegex = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		if (!msg.guildID || msg.author.bot) return true;
		if (cooldownMaps.has(msg.author.id) && cooldownMaps.get(msg.author.id) > Date.now()/1000) return;
		cooldownMaps.set(msg.author.id,(Date.now()/1000)+60);
		let guild = await bot.SQLHandler.getGuild(msg.guildID);
		let UserCurve = await bot.LevellingHandler.getUserCurve(msg.author.id,msg.guildID);
		let guildCurve = guild.xpCurve;
		delete UserCurve.userguildid;
		if (UserCurve.timeStarted+86400 < (Date.now()/1000)){
			UserCurve.timeStarted = Math.round(Date.now()/1000);
			UserCurve.currentlevelcurve = 0;
		}

		let amntXP = getRandomInt(Math.round(15*(guildCurve**UserCurve.currentlevelcurve)),Math.round(30*(guildCurve**UserCurve.currentlevelcurve)));
		let res = await bot.LevellingHandler.awardEXP(msg.author.id,msg.guildID,amntXP);
		UserCurve.currentlevelcurve++;
		await bot.LevellingHandler.updateCurve(msg.author.id,msg.guildID,UserCurve);
		if (res){
			if (guild.levelmsgs !== "none"){
				//Inject vars
				let lmsg = guild.levelmsgs || "Congrats 🎉 {MENTION}, You levelled up from {OLDLVL} to {NEWLVL}.";
				lmsg = lmsg.replace(/{MENTION}/g, msg.author.mention).replace(/{OLDLVL}/g, (res-1)).replace(/{NEWLVL}/g, (res) + "").replace(/{USERNAME}/g, msg.author.username).replace(/{ID}/g, msg.author.id);
				await bot.createMessage(guild.levelmsgchan && guild.levelmsgchan !== "none"? guild.levelmsgchan:msg.channel.id,lmsg);
				let parseLvl = parseLevelRewards(guild.levelrewards);
				let awards = parseLvl.filter(x=>x.level == res).map(x=>x.roleID);
				let dmChannel = await bot.getDMChannel(msg.author.id);
				awards.forEach(async (role) => {
					if (role === "none" || !role) return;
					let getRole = await msg.member.guild.roles.filter(x=>x.id === role);
					if (getRole.length == 0) return;
					getRole = getRole[0];
					
					bot.createMessage(dmChannel.id, "Good Job! You got the role ```"+getRole.name + "``` from the server`"+msg.member.guild.name+"`! ");
					msg.member.addRole(role,"Levelup Reward");
				});
				if (!guild.keepRolesWhenLevel && awards.length){
					parseLvl.filter(x=>x.level < res).map(x=>x.roleID).filter(x=>msg.member.roles.includes(x)).forEach(async (role)=>{
						if (role === "none" || !role) return;
						let getRole = await msg.member.guild.roles.filter(x=>x.id === role);
						if (getRole.length == 0) return;
						getRole = getRole[0];
						// bot.createMessage(dmChannel.id, "Role Lost: ```"+getRole.name + "``` from the server`"+msg.member.guild.name+"`! ");
						msg.member.removeRole(role,"Levelup Role Loss");


					});
				}
				let pardeDLvl  = parseLevelRewards(guild.levelremoves);
				let delvlrewards = pardeDLvl.filter(x=>x.level == res).map(x=>x.roleID);
				delvlrewards.forEach(async (role)=>{
					if (role === "none" || !role) return;
					let getRole = await msg.member.guild.roles.filter(x=>x.id === role);
					if (getRole.length == 0) return;
					getRole = getRole[0];		
					bot.createMessage(dmChannel.id, "While you were chatting on "+msg.member.guild.name+" you dropped something. It seems you dropped```"+getRole.name + "```!\n*You have lost the role "+getRole.name+"*");
					msg.member.removeRole(role,"Levelup Remove Reward");
				});
			}
		}
		
	}
});

