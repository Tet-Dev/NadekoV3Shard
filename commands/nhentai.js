const axios = require("axios");
const { Command } = require("eris-boiler/lib");
const nhentai = require("nhentai-js");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
module.exports = new Command({
	name: "nhentai", // name of command
	description: "(NSFW) Provides info about a doujin",
	run: (async (client, { msg, params }) => {
		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "nhentai"))) {
			return "You lack the permission `nhentai`";
		}
		if (!msg.channel.nsfw && msg.member) return "You need to perform this command either in a dm or in a NSFW Text Channel!";
		let sauce;
		if (!params[0] || params[0].toLowerCase() === "random") {
			let res = await axios.get("https://nhentai.net/random/");
			// console.log("Data: ",res.data);
			sauce = res.data.match(/<span class="hash">#<\/span>\d+<\/h3>/)[0].match(/\d+/)[0];
			// console.log(sauce);
		} else {
			sauce = params[0];
		}
		const doujin = await nhentai.getDoujin(sauce).catch((err) => { console.error(err); msg.channel.createMessage("Hmmm, it seems like your sauce has gone bad"); });
		if (!doujin) return;
		let f = [
		];
		if (doujin.details.parodies) {
			doujin.details.parodies.sort();
			f.push({
				name: "Parodies",
				value: "`{" + doujin.details.parodies.join("}   {") + "}`",
				inline: false
			});
		}
		if (doujin.details.characters) {
			doujin.details.characters.sort();
			f.push({
				name: "Characters",
				value: `\`{${doujin.details.characters.join("}   {")}}\``,
				inline: false
			});
		}
		if (doujin.details.tags) {
			doujin.details.tags.sort();
			f.push({
				name: "Tags",
				value: `\`{${doujin.details.tags.join("}   {")}}\``,
				inline: false
			});
		}
		if (doujin.details.artists) {
			doujin.details.artists.sort();
			f.push({
				name: "Artists",
				value: `\`{${doujin.details.artists.join("}   {")}}\``,
				inline: false
			});
		}
		if (doujin.details.groups) {
			doujin.details.groups.sort();
			f.push({
				name: "Groups",
				value: `\`{${doujin.details.groups.join("}   {")}}\``,
				inline: false
			});
		}
		if (doujin.details.languages) {
			doujin.details.languages.sort();
			f.push({
				name: "Languages",
				value: `\`{${doujin.details.languages.join("}   {")}}\``,
				inline: false
			});
		}
		return {
			embed: {
				title: doujin.title,
				image: { url: doujin.thumbnails[0] },
				url: doujin.link,
				description: "",
				fields: f
			}
		};
	}),
	options: {
		// aliases: ["nh"]
		parameters: ["the 6 digit number/sauce you would like or random if you are feeling lucky"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
