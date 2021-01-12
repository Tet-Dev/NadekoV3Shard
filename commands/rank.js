const { GuildCommand } = require("eris-boiler/lib");
const fs = require("fs");
const fsp = fs.promises;
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";	
}
// const Imgbb = require('imgbbjs')
const Imgbb = require("imgbbjs");
const imgbb = new Imgbb({
	key: "bce05b279cd7dab3250211eef6279495",
});

/**
 * @param {*} IMAGE It can binary file, base64 data, or a URL for an image. (up to 32 MB) (required)
 * @param {*} NAME The name of the file (optional) 
 * @return {object} Response of request, status 400 or 200
 */

const StreamToArray = require("stream-to-array");
module.exports = new GuildCommand({
	name: "rank", // name of command
	description: "Displays a rank card, snazzy!",
	run: (async (client, { msg, params }) => {
		// let waitM = await client.createMessage()
		msg.channel.sendTyping();
		let refMem = msg.member;
		if (params.length == 1) {
			if (params[0].startsWith("<@")) params[0] = params[0].replace(/\<\@/g, "").replace(/\>/g, "").replace(/\!/g, "");
			refMem = (await client.getRESTGuildMember(msg.guildID, params[0])) || refMem;
		}
		console.log("a");
		let img = await client.LevellingHandler.generateRankCard(refMem, refMem.guild);
		let stats = await fsp.stat(img.path);
		if (stats.size > 8388119) {
			// await msg.channel.createMessage("Sorry! Your rank card is currently too big!");
			let url = await imgbb.upload(`${img.boofer.toString("base64")}`, img.path.split("/").pop());
			url = url.data.url;
			await msg.channel.createMessage({
				embed: {
					image: {
						url: url
					}
				}
			});
		} else
			await client.createMessage(msg.channel.id, "*Dont like your rank card? try customizing it!*", { file: img.boofer, name: "RankCard." + img.fe });
		fs.unlink(img.path, () => { });
	}),
	options: {
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});