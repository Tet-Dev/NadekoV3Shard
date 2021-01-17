const axios = require("axios");
const { Command } = require("eris-boiler/lib");
const moment = require("moment");
// const Danbooru = require('danbooru');
const Booru = require('booru');
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
	name: "notlewd", // name of command
	description: "Gets a sfw image given the tags",
	run: (async (client, { msg, params }) => {

		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "notlewd"))) {
			return "You lack the permission `notlewd`";
		}
		// if (!msg.channel.nsfw && msg.member) return "You need to perform this command either in a dm or in a NSFW Text Channel!";
		// if (params > 2) {
		// 	return "You can only search by a max of 2 tags";
		// }
		let sites = ["safebooru.org", "gelbooru.com", "yande.re","danbooru"];
		let fallback = ["konachan.net"];
		shuffleArray(sites);
		let sindex = Math.floor(Math.random() * sites.length);
		let posts = await Booru.search(sites[sindex], params, { limit: 500, random: true }).catch(er=>{console.trace(er);client.createMessage("```"+er+"```");});
		if (!posts ) posts = await Booru.search(fallback[0], params, { limit: 500, random: true }).catch(er=>{console.trace(er);client.createMessage("```"+er+"```");});
		posts = posts.filter(x=>x.rating === "s");
		if (!posts || posts.length == 0) posts = await Booru.search(fallback[0], params, { limit: 500, random: true }).catch(er=>{console.trace(er);client.createMessage("```"+er+"```");});
		if (!posts || posts.length == 0) return "No Images found";
		posts = posts.filter(x=>x.rating === "s");
		
		// if (tempPosts.length == 0){
		// 	client.createMessage("Could not find the Lewd Stuff, looking through SFW images also");
		// }else{
		// 	posts = tempPosts;
		// }
		
		let post = posts[Math.floor(Math.random() * posts.length)];
		return {
			embed: {
				url: post.postView,
				description: `Posted at ${moment(post.createdAt.getTime()).fromNow()}`,
				image: {
					url: post.fileUrl
				},
				footer: {
					text: "Tags : " + post.tags.join(", ")
				}
			}
		};
	}),
	options: {
		// aliases: ["nh"]
		optionalParameters: ["Search Tags"]
		// parameters: [],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
