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
	name: "begin",
	description: "Begins your life in Waifu Wars!",
	options: {
		// parameters: [],
		// permission
		hidden: true,
	},
	displayName: "Begin",
	getValue: async (client, { msg }) => {
		// let tradeData = await client.ShopHandler.getAllTrades(msg.author.id);
		let userData = await client.SQLHandler.genericGet("userwaifus", "userid", msg.author.id);
		// let emoteslist = guildData.reactionroles ? parseEmotes(guildData.reactionroles) : [];
		return !userData.started ? "**Start Adventure**" : "Adventure Started";
		// });
	},
	run: (async (client, { msg, params }) => {
		let userData = await client.SQLHandler.genericGet("userwaifus", "userid", msg.author.id);
		if (userData.started) return "You already started off!";
		await msg.channel.sendTyping();
		await msg.channel.createMessage("Welcome to Waifu Wars!");
		await sleep(2500);
		await msg.channel.createMessage("To start off, you are going to need a starter waifu/husbando. I would personally only allow you to pick me, but that would be unfair, so I have to give you some options");
		await msg.channel.sendTyping();
		await sleep(8500);
		let reactmsg = await msg.channel.createMessage({
			embed: {
				"title": "Waifu/Husbando Options",
				"description": "Choose a Waifu/Husbando (Note that the other Waifus/Husbandos can be unlocked later on.",
				"url": "https://dazai.app/inventory",
				"color": null,
				"fields": [
					{
						"name": ":one: Dazai Osamu (100 HP/ 25 DMG)",
						"value": "Ability: **No Longer Human**\nWith my ability, No Longer human, I can disable any abilities used against me in battle!"
					},
					{
						"name": ":two: Nakajima Atsushi (175 HP / 35 DMG)",
						"value": "Ability: **Beast Beneath The Moonlight**\nWith his ability, He can {Insert Ability Idea}"
					},
					{
						"name": "A",
						"value": "A"
					}
				]
			}
		});
		let choices = ["1️⃣", "2️⃣", "3️⃣"];
		choices.forEach(x => reactmsg.addReaction(x));
		let res = await getReaction(reactmsg, msg.author);
		while (!choices.filter(x => x === res.emoji.name).length || !res) {
			res = await getReaction(reactmsg, msg.author);
		}

		if (!res) {
			return;
		}
		switch (res.emoji.name) {
		case "1️⃣":
			await client.ShopHandler.addWaifuToUser(msg.author.id, "wDazai").catch(er => console.trace(er));
			msg.channel.createMessage("Yay! Thanks for picking me! Lets start!");
			break;
		// case "2️⃣":
		// 	await client.ShopHandler.addWaifuToUser(msg.author.id, "wNakajima").catch(er => console.trace(er));
		// 	msg.channel.createMessage("Yay! Thanks for picking me! Lets start!");
		// 	break;
		case "3️⃣":

			break;
		default:
			break;
		}

		
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