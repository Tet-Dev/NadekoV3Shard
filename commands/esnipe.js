const axios = require("axios");
const { Command } = require("eris-boiler/lib");
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
//------------------------------------------------
module.exports = new Command({
	name: "esnipe", // name of command
	description: "Returns the latest edited message",
	run: (async (client, { msg, params }) => {

		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "snipe"))) {
			return "You lack the permission `esnipe`";
		}
		let msgs = client.esnipes.get(msg.channel.id);
		if (!msgs || msgs.length == 0) return "Nothing to snipe!";
		let refMsg = msgs.pop();
		client.esnipes.set(msg.channel.id, msgs);
		if (refMsg.embeds.length) {
			let webHooks = await msg.channel.getWebhooks();
			let hooks = [];
			for (let i = 0; i < webHooks.length; i++) {
				let hook = webHooks[i];
				if (hook.type == 1 && hook.name === "Dazai UwUSpeakHook") {
					hooks.push({ id: hook.id, token: hook.token });
				}	
			}
			if (hooks.length < 5) {
				for (let i = 0; i < (5 - hooks.length); i++) {
					let webhookInfo = await msg.channel.createWebhook({ name: "Dazai UwUSpeakHook", avatar: client.user.avatar }, "For UwuSpeak");
					hooks.push({ id: webhookInfo.id, token: webhookInfo.token });
					// hooks.push("https:\/\/discordapp.com/api/webhooks/" + webhookInfo.id + "/" + webhookInfo.token);
				}
			}
			let Selhook = hooks[(msg.author.id % 10) % hooks.length];
			refMsg.embeds.push({
				"title": `Edited Message Details: (ID: ${refMsg.id})`,
				// "url": `https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id}`,
				"description": `${(refMsg.content || " ")} [\\[Jump\\]](https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${refMsg.id})`,
				"color": 16738408,
				"author": {
					"name": refMsg.author ? refMsg.author.username + "#" + refMsg.author.discriminator : "Unknown author",
					"icon_url": refMsg.author ? refMsg.author.dynamicAvatarURL("png", 256) : client.user.dynamicAvatarURL("png", 256),
				},
				"footer": {
					"text": `Snipe requested by ${msg.author.username}#${msg.author.discriminator}`
				},
				"timestamp": require("dateformat")(Date.now(), "isoDateTime"),
			});
			let obj = {
				"username": client.user.username,
				avatarURL: client.user.dynamicAvatarURL("png",256),
				content: "Edited Message has an embed:",
				embeds: refMsg.embeds,
				auth: true,
				wait: true,
			};
			await client.executeWebhook(Selhook.id, Selhook.token, obj);
			return;
		}
		return {
			"content": null,
			"embed":
			{
				"title": `Edited Message (ID: ${refMsg.id})`,
				"description": `${(refMsg.content || " ")} [\\[Jump\\]](https://discord.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${refMsg.id})`,
				"color": 16738408,
				"author": {
					"name": refMsg.author ? refMsg.author.username + "#" + refMsg.author.discriminator : "Unknown author",
					"icon_url": refMsg.author ? refMsg.author.dynamicAvatarURL("png", 256) : client.user.dynamicAvatarURL("png", 256),
				},
				"footer": {
					"text": `Snipe requested by ${msg.author.username}#${msg.author.discriminator}`
				},
				// "url": ``,
				"timestamp": require("dateformat")(Date.now(), "isoDateTime"),
			}
		};
	}),
	options: {
		aliases: ["editsnipe"]
		// optionalParameters: ["number of messages to"]
		// parameters: [],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
