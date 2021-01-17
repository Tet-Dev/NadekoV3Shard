const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}

module.exports = new GuildCommand({
	name: "nick", // name of command
	description: "Changes somebody's nickname and \"Locks\" it (Preventing modification)",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "nickLock"))) {
			return "You lack the permission `nickLock`";
		}
		// return "Command WIP";
		let mention = msg.mentions[0];
		if (!mention) return "No mentions??";
		let newNick = params[1];
		if (!newNick) return "No New Nick?";
		if (newNick === "$$clear" && !(await client.permissionsHandler.checkForPerm(msg.member, "nickLockClear"))) return "You are missing the permission `nickLockClear`";
		let mem = await client.getRESTGuildMember(msg.guildID, mention.id).catch(er => { });
		if (!mem) return `Error Fetching Member with Username ${mention.username}! are you sure they are in your guild?`;
		if (!mem.guild || !mem.guild.name) mem.guild = client.getRESTGuild(msg.guildID);
		let allRoles = mem.guild.roles.filter(x => x).sort((a, b) => b.position - a.position);
		let menRoles = allRoles.filter(x => mem.roles.includes(x.id));
		let ClientMem = await client.getRESTGuildMember(msg.guildID, client.user.id);
		let botRoles = allRoles.filter(x => ClientMem.roles.includes(x.id));
		if (!botRoles.length) {
			return "Hmm, I dont seem to have any roles! Make sure to give me the appropriate roles!"
		}
		// if (!ClientMem.permissions.has("manageNicknames")) return "I need the ability to change other people's nicknames!"
		let highestBotRole = botRoles[0];
		let highestMemRole = menRoles[0];
		if (highestMemRole && highestMemRole.position >= highestBotRole) return `${mention.username} has a higher role than me! Please make sure I have a higher role!`
		let gData = await client.SQLHandler.getGuild(msg.guildID);

		let nickedUsers = gData.lockedGuildMemberNames ? gData.lockedGuildMemberNames.split("$$clear$$clear") : [];
		nickedUsers = nickedUsers.filter(x => x.split("$$clear")[0] !== mem.id);
		if (newNick !== "$$clear") {
			nickedUsers.push(`${mem.id}$$clear${client.SQLHandler.clean(newNick)}`);
			await mem.edit({
				nick: newNick !== "$$clear" ? newNick : ""
			});
		}

		await client.SQLHandler.updateGuild(msg.guildID,{
			lockedGuildMemberNames: nickedUsers.join("$$clear$$clear"),
		});
		if (newNick === "$$clear"){
			await mem.edit({
				nick: newNick !== "$$clear" ? newNick : ""
			});
		}
		return newNick !== "$$clear" ? "Member nick locked!" : "Member nick cleared!";
		// client.createMessage(msg.channel.id, "Pong!");


	}),
	options: {
		// aliases: ["p"],
		parameters: ["User Mention", "New Nickname or \'$$clear\' to clear"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});