const { GuildCommand } = require("eris-boiler/lib");
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

module.exports = new GuildCommand({
	name: "pvc", // name of command
	description: "Sends everyone from in the current VC into a private voice lounge in which nobody can join",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "pvc"))) {
			return "You lack the permission `pvc`";
		}
		if (!msg.member.voiceState.channelID) return "You must be in a Voice Channel to use this command!";
		let oldVC = await client.getChannel(msg.member.voiceState.channelID);
		if (!oldVC) return "Hmm thats odd, I couldn't get the details for your VC. Are you sure I have all the perms?";
		if (oldVC.name === "Dazai Private Lounge" ||oldVC.name === "Dazai Private Lounge§§") return "You cannot create a private lounge in a Private Lounge";
		let members = oldVC.voiceMembers.filter(x=>x);
		
		if (!members ||!members.length) return "Nobody in VC";
		let parentChan = msg.member.guild.channels.filter(x=>x.type === 4 && x.name === "Private Lounges")[0];
		if (!parentChan){
			parentChan = await client.createChannel(msg.guildID,"Private Lounges",4);
		}
		let newVc = await client.createChannel(msg.guildID,"Dazai Private Lounge§§",2,{
			parentID: parentChan.id,
		});
		let wait = newVc.editPermission(msg.member.guild.id,35652096,30408705,"role","Private Lounge");
		await Promise.all(members.map(async (x)=>{
			await x.edit({
				channelID: newVc.id,
			});
			return x;
		}));
		await wait;
		await newVc.edit({
			name: "Dazai Private Lounge"
		});
		return "Sent everyone into a lounge!";
	}),
	options: {
		aliases: ["privatevoicechannel"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});