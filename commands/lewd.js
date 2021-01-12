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
	name: "lewd", // name of command
	description: "(NSFW) Gets a random image of a lewd character",
	run: (async (client, { msg, params }) => {

		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "lewd"))) {
			return "You lack the permission `lewd`";
		}
		if (!msg.channel.nsfw && msg.member) return "You need to perform this command either in a dm or in a NSFW Text Channel!";
		// if (params > 2) {
		// 	return "You can only search by a max of 2 tags";
		// }
		let sites = ["gelbooru.com", "rule34.xxx", "xbooru.com", "rule34.paheal.net","danbooru"];
		let fallback = ["konachan.com"];
		shuffleArray(sites);
		let sindex = Math.floor(Math.random() * sites.length);
		let posts = await Booru.search(sites[sindex], params, { limit: 500, random: true }).catch(er=>{console.trace(er);client.createMessage("```"+er+"```");});
		if (!posts) posts = await Booru.search(fallback[0], params, { limit: 500, random: true }).catch(er=>{console.trace(er);});
		posts = posts.filter(x=>x.rating === "e");
		if (!posts || posts.length == 0) posts = await Booru.search(fallback[0], params, { limit: 500, random: true }).catch(er=>{console.trace(er);});
		if (!posts || posts.length == 0) return "No Lewds found";
		let tempPosts = posts.filter(x=>x.rating === "e");
		
		if (tempPosts.length == 0){
			client.createMessage("Could not find the Lewd Stuff, looking through SFW images also");
		}else{
			posts = tempPosts;
		}
		
		let post = posts[Math.floor(Math.random() * posts.length)];
		return {
			embed: {
				title: "A Lewd",
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








		// let posts = await booru.posts({ tags: `${params.join(" ")}`, limit: 1000 }).catch(er => console.trace(er));
		// posts = posts.filter(x => x);
		// let index = Math.floor(Math.random() * posts.length);
		// if (!posts.length) return "Could not find a lewd!";
		// let post = posts[index];
		// let attempts = 0;
		// while (!post.large_file_url && attempts < 20) {
		// 	index = Math.floor(Math.random() * posts.length);
		// 	post = posts[index];
		// 	attempts++;
		// }

		// if (!post.large_file_url) return "Could not find a lewd!";


	}),
	options: {
		// aliases: ["nh"]
		// parameters: [],
		optionalParameters: ["Search Tags"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
