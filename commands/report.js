const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
const moment = require("moment");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "report", // name of command
	description: "Report a bug! Abuse of this feature may result in getting blacklisted from this feature",
	run: (async (client, { msg, params }) => {
		if (client.reportBlocklist.includes(msg.author.id)) return "You have been Blocklisted!";
		let sendContext = false;
		if (msg.author.bot) return;
		let am = await msg.channel.createMessage("Sending Report...");
		let firstArg;
		if (params.length>0){
			firstArg = params.shift().toLowerCase();
			if (firstArg !== "yes" && firstArg !== "no"){
				return "The first Argument must be either yes or no!";
			}
		}else{
			firstArg = "yes"
		}

		if (params.length >= 1 && firstArg === "yes")
			sendContext = await msg.channel.getMessages(9, msg.id);
		let attachment = msg.attachments[0];
		let embedSend = {
			author: {
				name: `${msg.author.username}#${msg.author.discriminator}`,
				icon_url: msg.author.avatarURL
			},
			description: params.join(" "),
			fields: !attachment ? [] : [{ name: "Link", value: attachment.url }],
			
		};
		if (attachment && attachment.url){
			embedSend.image = {
				url: attachment ? attachment.url : "https://dazai.app",
			};
		}
		
		//https://ptb.discord.com/api/webhooks/790485574095077376/hGT6NAFv4x8Pd2adnpjrxJapSkYZ3u3oNA37cLhPlyuLyNRFz6QqSA5tDZEhAUz9Ha35
		let reportMSG = await client.createMessage("790481772952813581", {
			content: "New Bug Report!", embed: embedSend
		});
		if (sendContext && sendContext.length) {
			await client.createMessage("790481772952813581",`=================${reportMSG.id}=================`);
			sendContext.reverse();
			for (let i = 0; i < sendContext.length;i++){
				let referMsg = sendContext[i];
				await client.executeWebhook("790485574095077376","hGT6NAFv4x8Pd2adnpjrxJapSkYZ3u3oNA37cLhPlyuLyNRFz6QqSA5tDZEhAUz9Ha35",{
					wait: true,
					username: `${referMsg.author.username}#${referMsg.author.discriminator}`,
					avatarURL: referMsg.author.dynamicAvatarURL("png",256),
					content: referMsg.content,
					embeds: referMsg.embeds,
					allowedMentions:{
						everyone: false,
						roles: false,
						users: false,

					},
					auth: true,
				});
			}
			client.createMessage("790481772952813581",`=================${reportMSG.id}=================`);
		}
		am.edit({content:"Your Bug report has been sent!"});

	}),
	options: {
		// aliases: ["p"],
		optionalParameters: ["Send a snippet of the current conversation?(~Last 10 Messages) Yes / No (Defaults to no)", "Any additional comments? File attachments will also show!"]
		// parameters: ["Song Youtube Link / Spotify Playlist / Youtube Playlist / Song Name"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});