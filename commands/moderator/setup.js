const { SettingCommand } = require("eris-boiler/lib");
const { ReactionCollector, MessageCollector } = require("eris-collector");
const moment = require("moment");
// const pluri
function getNextMessageForPrompt(bot, msg) {
	return new Promise((res, rej) => {
		let msgs = new MessageCollector(bot, msg.channel, (m) => m.author.id === msg.author.id, { max: 1 });
		msgs.on("collect", masg => {
			res(masg);
		});
		setTimeout(() => {
			res("to");
		}, 300000);
	});
}
const EmbedPaginator = require("eris-pagination");
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
module.exports = new SettingCommand({
	name: "setup",
	description: "Start the setup process to setup AI Mod",
	options: {
		parameters: [],
		// permission
	},
	displayName: "Setup Moderation",
	getValue: async (bot, { channel }) => {
		return " ";
	},
	run: async (bot, { msg, params }) => {
		let refmsg = msg;
		if (!await bot.permissionsHandler.checkForPerm(msg.member, "admin")) return "Admin role is required to execute this command!";
		await bot.createMessage(msg.channel.id, `Please mention all the channels you would like to have AI moderation on! ex: <#${msg.channel.id}> or type \`cancel\` to cancel.`);

		let res1 = await getNextMessageForPrompt(bot, msg);

		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		let allChans = res1.content.match(/(?:<#)\d+>/g);
		if (!allChans) return "Request Cancelled due to no channels mentioned";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting toxicity. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let toxicity = parseInt(res1.content);
		if (toxicity > 100 || toxicity < 0)
			return "Toxicity has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting **severe** toxicity. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let severetoxicity = parseInt(res1.content);
		if (severetoxicity > 100 || severetoxicity < 0)
			return "Severe Toxicity has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting attacks on identity(racism, homophobia, etc.). A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let identityAttack = parseInt(res1.content);
		if (identityAttack > 100 || identityAttack < 0)
			return "Attacks on identity has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting insults. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let insults = parseInt(res1.content);
		if (insults > 100 || insults < 0)
			return "Insult detection has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting profanity. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let profanity = parseInt(res1.content);
		if (profanity > 100 || profanity < 0)
			return "Profanity detection has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting threats. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let threats = parseInt(res1.content);
		if (threats > 100 || threats < 0)
			return "Threat detection has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting sexually explicit content. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let explicit = parseInt(res1.content);
		if (explicit > 100 || explicit < 0)
			return "Sexually explicit content detection has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "How sensitive should the bot be in detecting flirtation. A **whole number** value between 0-100. Type 0 if you just dont even want to scan for it. I personally reccomend a value of around 10 or 20.");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (isNaN(parseInt(res1.content)) || res1.content.includes("."))
			return "Please try again with an actual whole number!";
		let flirtation = parseInt(res1.content);
		if (flirtation > 100 || flirtation < 0)
			return "Flirtation has to be bigger than or equal to 0 and less than or equal to 100";
		await bot.createMessage(msg.channel.id, "And finally, what should I do when I find someone engaging in any of the behaviors? valid options are `mute DURATION`,`warn` or `polite`(politely asks them to try again)\nCurrently warn and polite only work!");
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		let punishment = res1.content.toLowerCase();
		if (!punishment.startsWith("mute") && punishment !== "warn" && punishment !== "polite"){
			return "Request cancelled; Not a valid consequence";
		}
		let actualPunishment = punishment;
		let extra = "";
		if (punishment.startsWith("mute")){
			let temp = punishment.split(" ");
			actualPunishment =  actualPunishment.split(" ");
			actualPunishment[1] = secondsFromDhms(actualPunishment[1]);
			actualPunishment =actualPunishment.join(" ");
			// temp[1] = ;
			punishment = `mute`;
			extra = ` for ${moment.duration(secondsFromDhms(temp[1])*1000).humanize()} `;
		}
		await msg.channel.createMessage(`Heres what I got:
On the following channels:
		${allChans.join(" ")}
		Enable Moderation with sensetivity values:\`\`\`
		Toxicity: ${toxicity}
		Severe Toxicity: ${severetoxicity}
		Attacks On Identity: ${identityAttack}
		Insult: ${insults}
		Profanity: ${profanity}
		Threats: ${threats}
		Sexually Explicit Content: ${explicit}
		Flirtation: ${flirtation}\`\`\`and when someone engages in any of these behaviors ${punishment} them${extra}
		is this correct?(type Y or N)`);
		res1 = await getNextMessageForPrompt(bot, msg);
		if (!res1.content || res1.content.toLowerCase() === "cancel") {
			return "Request Cancelled!";
		}
		if (res1.content.toLowerCase() === "y") {
			msg.channel.createMessage(`Saving settings...`);
			for (let i = 0; i < allChans.length; i++) {
				console.log(allChans[i].match(/\d+/g)[0]);
				await bot.SQLHandler.updateChannel(allChans[i].match(/\d+/g)[0], {
					TOXICITY: toxicity,
					SEVERE_TOXICITY: severetoxicity,
					IDENTITY_ATTACK: identityAttack,
					INSULT: insults,
					PROFANITY: profanity,
					THREAT: threats,
					SEXUALLY_EXPLICIT: explicit,
					FLIRTATION: flirtation,
					parentGuild: msg.guildID,
					Consequence: actualPunishment,
				}).catch(er => msg.channel.createMessage("Error:```" + er + "```"));
			}
			msg.channel.createMessage(`Settings Saved!`);
		}
	}
});
//channelID, disable_smartquoting, gainxp, uwuspeak, parentGuild, aiChatOn, AIModerationOn, TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT, SEXUALLY_EXPLICIT, FLIRTATION, Consequence