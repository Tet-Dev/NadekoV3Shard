const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
let scoreRemap = new Map();
//TOXICITY, SEVERE_TOXICITY, IDENTITY_ATTACK, INSULT, PROFANITY, THREAT, SEXUALLY_EXPLICIT, FLIRTATION, Consequence
scoreRemap.set("TOXICITY",{
	adj: "toxic"
});
scoreRemap.set("SEVERE_TOXICITY",{
	adj: "super toxic"
});
scoreRemap.set("IDENTITY_ATTACK",{
	adj: "mean"
});
scoreRemap.set("INSULT",{
	adj: "insulting"
});
scoreRemap.set("PROFANITY",{
	adj: "profane"
});
scoreRemap.set("THREAT",{
	adj: "threatening"
});
scoreRemap.set("SEXUALLY_EXPLICIT",{
	adj: "explicit"
});
scoreRemap.set("FLIRTATION",{
	adj: "flirty"
});
let allKeys = ["TOXICITY", "SEVERE_TOXICITY", "IDENTITY_ATTACK", "INSULT", "PROFANITY", "THREAT", "SEXUALLY_EXPLICIT", "FLIRTATION"];

module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		// return;
		if (!msg.author.bot || !msg.guildID) {
			let channelData = await bot.SQLHandler.getChannel(msg.channel.id);
			if (allKeys.filter(x=>channelData[x]).length == 0){
				return;
			}
			let guilddata = await bot.SQLHandler.getGuild(msg.guildID);
			if (guilddata.AImessagesLeft == 0){
				return;
			} 
			if (guilddata.AImessagesLeft > 0){
				await bot.SQLHandler.updateGuild(msg.guildID,{
					AImessagesLeft: guilddata.AImessagesLeft-1
				});
			}
			
			// if (channe)
			// console.log("processing")
			let res = await bot.AIManager.analyzeComment(msg).catch(er=>console.error(er));
			if (!res) return;

			let scores = Object.keys(res.attributeScores).sort((a, b) => res.attributeScores[b].summaryScore.value - res.attributeScores[a].summaryScore.value);
			// console.log(res.attributeScores);
			let offenses = [];
			for (let i = 0; i < scores.length; i++) {
				let scorename = scores[i];
				if (res.attributeScores[scorename].summaryScore.value * 100 - (100 - channelData[scorename]) > 0) {
					offenses.push(
						{
							score: res.attributeScores[scorename].summaryScore,
							offenseName: scorename,
						}
					);

				}
			}

			if (offenses.length) {
				let allWords =offenses.map(x=>scoreRemap.get(x.offenseName).adj);
				let wordStr = allWords[0];
				for (let i = 1; i < allWords.length;i ++){
					if (i == allWords.length-1 ){
						wordStr += " and "+allWords[i];
					}else{
						wordStr += ", "+allWords[i];
					}
				}
				switch (channelData.Consequence) {
				case "warn":
					bot.PunishmentHandler.addPunishment(msg.member.guild,msg.member,"warn", 0, `Being \`\`\`${wordStr}\`\`\` in chat. Message: \`\`\`${msg.content}"\`\`\``, bot.user);
					break;
				case "mute":
					bot.PunishmentHandler.addPunishment(msg.member.guild,msg.member,"warn", 0, "", bot.user);
					break;

				default:
					msg.channel.createMessage({
						content: `Hey uh ${msg.author.mention}, this is kinda ${wordStr} of you to say! Maybe try being a bit kinder?`,
						embed: {
							description: msg.content,
							author:{
								name: `${(msg.member.nick || msg.author.username )}#${msg.author.discriminator}`,
								icon_url: msg.author.dynamicAvatarURL("png",256)
							}
						}
					});
					break;
				}
				//messageReferenceID;
			}
			// console.log(offenses, "done!");
		}

	}
});

