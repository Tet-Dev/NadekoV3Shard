const { DiscordEvent } = require("eris-boiler/lib");
const ReactionHandler = require("eris-reactions");
const axios = require("axios");
module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		
		if (!msg.author.bot){
			let channelData = await bot.SQLHandler.getChannel(msg.channel.id);
			// if (channe)
			// console.log("processing")
			let res = await bot.AIManager.analyzeComment(msg);
			
			let scores = Object.keys(res.attributeScores).sort((a,b)=>res.attributeScores[b].summaryScore.value - res.attributeScores[a].summaryScore.value);
			console.log(res.attributeScores);
			msg.channel.createMessage("Anal done!```"+scores.map(x=>`${x} | ${res.attributeScores[x].summaryScore.value*100}%`).join("\n")+"```");
		}

	}
});

