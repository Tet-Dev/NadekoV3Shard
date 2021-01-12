const { SettingCommand } = require("eris-boiler/lib");
// const ytpl = require("ytpl");
// const ytsr = require("ytsr");
// const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
function isEmoji(str) {
	var ranges = [
		"(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])" // U+1F680 to U+1F6FF
	];
	if (str.match(ranges.join("|"))) {
		return true;
	} else {
		return false;
	}
}
function parseEmotes(str){
	let allEStr = str.split("|").filter(x=>x);
	return allEStr.map(x=>{
		let miniargs = x.split(",");
		let msgChannel = miniargs[0].split("§");
		let emoot = miniargs[1];
		if (miniargs[1].includes(":")){
			emoot = miniargs[1].split(":");
			emoot = emoot[emoot.length-1];
		}
		return {
			channel: msgChannel[0],
			id : msgChannel[1],
			
			emote : emoot,
			roleID : miniargs[2]
		};
	});
}
function stringifyEmotes(arr){
	return arr.map(x=>x.channel+"§"+x.id+","+x.emote+","+x.roleID).join("|");
}
// |769235184133603334§769246805304934491,<:D20:769245803226202203>,769235184125870080|769254904748572682§769259723831902219,🎟️,769238973951639582
//|739559911150583820§742171996661612565,✅,739559911096057920|739559911150583820§742171996661612565,📰,739559911096057918|739559911150583820§742171996661612565,🗳️,739559911096057919|739559911150583820§742171996661612565,🍿,739559911096057921|739559911150583820§742171996661612565,😳,739559911096057922|739559911150583820§742171996661612565,🖥️,742172387478470736|739559911150583820§742171996661612565,🧠,739559911033405598|739559911150583820§754826617406095491,<:KenjiThink:756613669990695094>,754825149307682922|739559911150583820§754826617406095491,<:NadThink:754826341219696800>,754825149307682922|739559911150583820§762106526135353354,🧠,762106028098584627|739559911150583820§775098884791205938,👀,775098015870091304
module.exports = new SettingCommand({
	name: "create",
	description: "Creates a reaction Role",
	options: {
		parameters: ["Channel ID", "Message ID", "Emote(Must be either an in-server emote or a default emote)", "Role ID or Mention"],
		// permission
	},
	displayName: "Create A Reaction Role",
	getValue: async () => {
		return "Create A Reaction role with `rero create ChannelID MessageID Emote RoleID/Mention`\n*Requires either Admin power";
	},
	run: (async (client, { msg, params }) => {
		if (!await client.permissionsHandler.checkForPerm(msg.member, "admin")) return "You are lacking Admin power!";
		let referencedMsg = await client.getMessage(params[0], params[1]).catch(er=>{});
		if (!referencedMsg) return "I could not find the message specified!";
		let roleid = params[3].replace(/\<\@\&/g,"").replace(/\>/g,"");
		if (msg.member.guild.roles.filter(x=>x.id === roleid).length != 1) return "The Role you mentioned ("+roleid+")does not exist!";
		// <@&739559911150583819>
		let emote = params[2];
		let emoteName;
		let emoteID;
		if (emote.includes(":")) {
			
			emoteID = emote.split(":")[2].split(">")[0];
			let allIds = msg.member.guild.emojis.map(x=>x.id);
			if (!allIds.filter(x=>x === emoteID).length) return "the emote used must be either a defualt emoji or an emoji from your server";

		} else if (isEmoji(emote)){
			emoteName = emote;
		}else{
			return "The Emoji (```"+emote+"```) is invalid";
		}
		await referencedMsg.addReaction(emote.replace("<a:","").replace("<","").replace(">",""));
		let guildData = await client.SQLHandler.getGuild(msg.guildID);
		let emoteslist = guildData.reactionroles ? parseEmotes(guildData.reactionroles):[];
		if (emoteslist.length >=40) return "Sorry, I have a limit of 40 reaction roles per guild! Consider deleting some or running `rero autopurge` to clean up any that don't exist";
		emoteslist.push({
			channel: params[0],
			id: params[1],
			emote: emoteID || emoteName,
			roleID: roleid
		});
		await (client.SQLHandler.updateGuild(msg.guildID,{reactionroles : stringifyEmotes(emoteslist)}));
		
		return "Reaction Role Set!";



		
	}),// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});
