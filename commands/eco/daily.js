const { Command } = require("eris-boiler/lib");
const moment = require("moment");
// const { owner: permission } = require('../../permissions')

module.exports = new Command({
	name: "daily",
	description: "Gets your daily bonus",
	options: {
		// optionalParameters: ["", "New XP Curve"]
		// parameters: ["Who are you paying? Mention or ID required", "Amount"],
		// permission
	},
	displayName: "Daily Command",
	getValue: async (bot, { msg }) => {
		return "Recieve some daily DazCoins";
	},
	run: async (bot, { msg, params }) => {
		let data = await bot.SQLHandler.genericGet("personaldata","userid",msg.author.id);
		if (Date.now()-data.lastdaily >= 86400000){
			let ecoAdded;
			if (Date.now()-data.lastdaily > 172800000){
				data.streak = 1;
				ecoAdded = 20;
			}else{
				data.streak++;
				ecoAdded = Math.max(Math.floor(20 + ((data.streak-1)*2.5)),100);
			}
			let coinGive = await bot.EconomyHandler.addToBal(msg.author.id,ecoAdded,`Daily Coins Streak of ${data.streak}`);
			if (!coinGive) return "An error occured giving the daily bonus";
			delete data.userid;
			data.lastdaily = Date.now();
			await bot.SQLHandler.genericUpdate("personaldata","userid",msg.author.id,data);
			return `Daily Bonus claimed! You gained 20 ${ecoAdded-20 > 0? `+ ${ecoAdded-20} Streak bonus` : ""}DazCoin! Come back tomorrow to claim more and build up your streak!`;
		} else{
			return `You claimed your daily dazcoin bonus ${moment(parseInt(data.lastdaily)).fromNow()}, you are eligible to claim ${moment(parseInt(data.lastdaily) + 86400000).fromNow()}.`;
		}
	},
});
