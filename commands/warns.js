const axios = require("axios");
const moment = require("moment");
// const Danbooru = require('danbooru');
const Booru = require("booru");
const { meanBy } = require("lodash");
const { GuildCommand } = require("eris-boiler");

const EmbedPaginator = require("eris-pagination");

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
module.exports = new GuildCommand({
	name: "warns", // name of command
	description: "View Warns",
	run: (async (client, { msg, params }) => {
		if (params.length == 0){
			if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "viewSelfWarns"))){
				return "You lack the permission `viewSelfWarns`";
			}
			let allSelfWarns = Array.from(await client.SQLHandler.query(`SELECT * FROM nadekoguilddata.guildwarnings WHERE guildid = "${msg.guildID}" and userid= "${msg.author.id}"`));
			// console.log(allSelfWarns.length);
			allSelfWarns.sort((a,b)=>parseInt(b.timestamp)-parseInt(a.timestamp));
			allSelfWarns = allSelfWarns.chunk_inefficient(allSelfWarns.length > 5? 5 :allSelfWarns.length);
			// console.log(allSelfWarns.length);
			let allPages = allSelfWarns.map(x=>{
				// console.log(x);
				return {
					title: `Warns for ${msg.author.username}#${msg.author.discriminator}`,
					fields: x.map(y=>{
						return {
							name: y.warningID,
							value: `\`\`\`${y.reason.replace(/`/g,"`​")}\`\`\` Warned by <@${y.warner}> ${moment(parseInt(y.timestamp)).fromNow()}`
						};
					})
				};
			});
			if (allPages.length == 1){
				return {
					embed: allPages[0]
				};
			}
			EmbedPaginator.createPaginationEmbed(msg,allPages);
			return;
		}

		if (msg.member && !(await client.permissionsHandler.checkForPerm(msg.member, "viewWarns"))) {
			return "You lack the permission `viewWarns`";
		}
		if (!msg.content.match(/\d+/)){
			return `Please mention someone or specify their userID!`
		}
		let allSelfWarns = Array.from(await client.SQLHandler.query(`SELECT * FROM nadekoguilddata.guildwarnings WHERE guildid = "${msg.guildID}" and userid= "${msg.content.match(/\d+/)[0]}"`));
		// console.log(allSelfWarns.length);
		allSelfWarns.sort((a,b)=>parseInt(b.timestamp)-parseInt(a.timestamp));
		allSelfWarns = allSelfWarns.chunk_inefficient(allSelfWarns.length > 5? 5 :allSelfWarns.length);
		// console.log(allSelfWarns.length);
		let warnUser = await client.getRESTUser(msg.content.match(/\d+/)[0]);
		let allPages = allSelfWarns.map(x=>{
			// console.log(x);
			return {
				title: `Warns for ${warnUser.username}#${warnUser.discriminator}`,
				fields: x.map(y=>{
					return {
						name: y.warningID,
						value: `\`\`\`${y.reason.replace(/`/g,"`​")}\`\`\` Warned by <@${y.warner}> ${moment(parseInt(y.timestamp)).fromNow()}`
					};
				})
			};
		});
		if (allPages.length == 1){
			return {
				embed: allPages[0]
			};
		}
		EmbedPaginator.createPaginationEmbed(msg,allPages);
		return;
	}),
	options: {
		// aliases: ["nh"]
		optionalParameters: ["User ID / Mention"],
		// parameters: ["User ID / Mention"],
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
