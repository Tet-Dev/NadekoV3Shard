const { Command } = require("eris-boiler/lib");
// const { owner: permission } = require('../../permissions')

module.exports = new Command({
	name: "bal",
	description: "Gets your balance or another user's bal",
	options: {
		// parameters: ["gets a user's balance given its ID or Ping or your own if no argument is passed"],
		// permission
		optionalParameters: ["User ID/Mention"],
	},
	displayName: "Balance",
	getValue: async (bot, { msg }) => {
		let bal = await bot.EconomyHandler.getBal(msg.author.id);
		return "You have **" + bal + "** DC\n*to view someone else's balance, try `eco bal MENTION/ID`*";
	},
	run: async (bot, { msg, params }) => {
		if (params.length == 0) {
			return "You have `" + (await bot.EconomyHandler.getBal(msg.author.id) + "` DC");
		}
		let usr = await bot.getRESTUser(params[0].replace("<@", "").replace("<@!", "").replace(">", "")).catch((er) => {
			bot.createMessage(msg.channel.id, "I Don't Know Who that is!");
		});
		if (usr) return usr.username + " has `" + (await bot.EconomyHandler.getBal(usr.id) + "` DC");
		// return 
	}
});
