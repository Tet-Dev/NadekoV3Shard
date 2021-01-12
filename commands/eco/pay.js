const { SettingCommand } = require("eris-boiler/lib");
// const { owner: permission } = require('../../permissions')

module.exports = new SettingCommand({
	name: "pay",
	description: "Gets your balance or another user's bal",
	options: {
		parameters: ["Who are you paying? Mention or ID required", "Amount"],
		// permission
	},
	displayName: "Pay Command",
	getValue: async (bot, { msg }) => {
		return "Pay someone with `eco pay` (10% Tax Rounded Up) Min. 2 DC";
	},
	run: async (bot, { msg, params }) => {
		let p0 = params.shift().replace("<@","").replace("<@!","").replace(">","");
		if (p0 === msg.author.id) return "You cannot send money to yourself!";
		let p1 = parseInt(params.shift());
		if (p1 < 2){
			return "Each Transaction must include at minimum 2 DazCoins!";
		}
		if (await bot.getRESTUser(p0)){
			if ((await bot.EconomyHandler.getBal(msg.author.id))-p1 < 0){
				return "You do not have that much DazCoin to send!";
			}
			return (await bot.EconomyHandler.sendMoney(msg.author.id,p0,p1,params.join(" ")))? "DazCoin Sent!":"Sending DazCoins Failed!"
		}
		return "I don't know who that is!";
	},
});
