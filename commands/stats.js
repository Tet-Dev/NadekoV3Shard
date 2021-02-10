const { GuildCommand } = require("eris-boiler/lib");
const fs = require("fs");
const moment = require("moment");
// isMoment
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
// const StreamToArray = require("stream-to-array");
// const rank = require("./rank");
module.exports = new GuildCommand({
	name: "stats", // name of command
	description: "Get your current server stats",
	run: (async (client, { msg, params }) => {
		try {
			let thing = client.createMessage(msg.channel.id, "Fetching info for " + msg.member.guild.name);
			let grabdata = await client.SQLHandler.getGuild(msg.guildID);
			let emotes = await msg.member.guild.getRESTEmojis();
			let emoteString = "";
			let emoarr = [];
			emotes.forEach((x) => {
				let b4emo = emoteString;
				if (x.animated) {
					emoteString += "<a:" + x.name + ":" + x.id + ">";
				} else {
					emoteString += "<:" + x.name + ":" + x.id + ">";
				}
	
				if (emoteString.length > 1024) {
					emoarr.push({
						name: "Emotes",
						value: b4emo,
						inline: true,
					});
					if (x.animated) {
						emoteString = "<a:" + x.name + ":" + x.id + ">";
					} else {
						emoteString = "<:" + x.name + ":" + x.id + ">";
					}
				}
			});
			// if (emoarr.length == 0){
			// 	emoarr.push({
			// 		name: "Emotes",
			// 		value: "None!",
			// 		inline: true,
			// 	})
			// }
			emoarr.push({
				name: "Emotes",
				value: emoteString || "None!",
				inline: true,
			});
			let allmems = msg.member.guild.members.filter((x) => true);
			let boost = grabdata.boosters? grabdata.boosters.split("§") : [];
			let bstring = "";
			boost.sort((f, s) => f.split(",")[1] - s.split(",")[1]);
			boost.forEach((item) => {
				let user = item.split(",");
				let count = user[1];
				let time = user[2] || 33134774400000;
				user = user[0];
				bstring += "[<@!" + user + ">, " + count + " boost(s) ending in " + moment(time).fromNow() + " ]";
	
			});
			if (boost.length == 0) {
				bstring = "N/A.";
			}
			msg.channel.createMessage( {
				embed: {
					title: "Server Stats",
					thumbnail: {
						url: msg.member.guild.iconURL || client.user.avatarURL
					},
					description: "Dazai joined at: " + moment(msg.member.guild.joinedAt).format("MM/DD/YYYY") + "\nMembers Online: " + allmems.filter((x) => x.status === "online").length + "/" + allmems.length + "\nMembers Idle/Do Not Disturb: " + allmems.filter((x) => x.status === "idle").length + "/" + allmems.filter((x) => x.status === "dnd").length + "\nOthers: " + allmems.filter((x) => ["online", "idle", "dnd"].includes(x.status)).length + "\nDazai Boost Level: " + (grabdata.premium || "None 😭") + "\n Boosters: " + bstring,
					fields: emoarr
	
				}
			});
		} catch (er) {
			console.log(er);
		}
	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: client (DataClient), msg (Message), params (String[])
});