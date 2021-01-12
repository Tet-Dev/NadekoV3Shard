const ReactionHandler = require("eris-reactions");
const { SettingCommand } = require("eris-boiler/lib");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function getReaction(msg, user) {
	return new Promise((res, rej) => {
		const reactionListener = new ReactionHandler.continuousReactionStream(
			msg,
			(userID) => (userID.id ? userID.id : userID) === user.id,
			false,
			{ maxMatches: 1, time: 60000 }
		);
		reactionListener.on("reacted", async (event) => {
			res(event);
		});
		setTimeout(() => {
			msg.delete();
			rej("No Response");
		}, 60000);
	});
}
async function setupReactions(reactions, channel, prompt, user) {
	let message = await channel.createMessage(prompt);
	reactions.forEach(x => {
		message.addReaction(x);
	});
	return getReaction;
}
module.exports = new SettingCommand({
	name: "set",
	description: "Sets your waifu team!",
	options: {
		// parameters: [],
		// permission
		hidden: true,
	},
	displayName: "Cust",
	getValue: async (client, { msg }) => {
		// let tradeData = await client.ShopHandler.getAllTrades(msg.author.id);
		let userData = await client.SQLHandler.genericGet("userwaifus", "userid", msg.author.id);
		// let emoteslist = guildData.reactionroles ? parseEmotes(guildData.reactionroles) : [];
		return !userData.main ? "No Waifus in main!" : `You have ${JSON.parse(userData.main).length}/5 waifus active`;
		// });
	},
	run: (async (client, { msg, params }) => {
		let userData = await client.SQLHandler.genericGet("userwaifus", "userid", msg.author.id);
		if (!userData.started) return "Your adventure has not begun! do `waifu begin` to start";
		let inv = await client.ShopHandler.getInventory(msg.author.id);
		let allitems = await client.ShopHandler.getAllItems();
		allitems = allitems.filter(x=>x.type === "Waifu/Husbando");

		inv = inv.filter(x=>allitems.includes(x.id));
		if (inv.length == 0) return "You have no waifus/husbandos in your inventory!";
		inv = await Promise.all(inv.map(async (x)=>{
			let waifu = await client.ShopHandler.getWaifu(x.id);
			return waifu.currentOwner === msg.author.id? waifu : null;
		}));
		inv = inv.filter(x=>x);

		
		// reactMSG.addReaction("🔽");
		// let react = await getReaction(reactMSG,msg.author);
		// if (!react) return;
		// reactMSG.edit({
		// 	content: reactMSG.content + "\nTo start off, you are going to need a starter waifu/husbando. I would personally only allow you to pick me, but that would be unfair, so I have to give you some options"
		// })
		//To start off, you are going to need a starter waifu/husbando. I would personally only allow you to pick me, but that would be unfair, so I have to give you some options

	}),// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});