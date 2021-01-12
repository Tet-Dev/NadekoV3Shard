const ReactionHandler = require("eris-reactions");
const { SettingCommand } = require("eris-boiler/lib");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function getReaction(msg, user) {
	return new Promise((res, rej) => {
		const reactionListener = new ReactionHandler.continuousReactionStream(
			msg,
			(userID) => (userID.id ? userID.id : userID) === user.id,
			false,
			{ maxMatches: 1, time: 60000 }
		);
		reactionListener.on("reacted", async (event) => {
			res(event);
		});
		setTimeout(() => {
			msg.delete();
			rej("No Response");
		}, 60000);
	});
}
async function setupReactions(reactions, channel, prompt, user) {
	let message = await channel.createMessage(prompt);
	reactions.forEach(x => {
		message.addReaction(x);
	});
	return getReaction;
}
module.exports = new SettingCommand({
	name: "server",
	description: "Boosts the current server you are in!",
	options: {
		// optionalParameters: ["pass in `wasd` to activate wasd mode and chaining!(To Escape WASD mode, type `exit`)"],
		// permission
		parameters: ["Type of boost. Options : 1d/2d/5d/1w/1m"],
	},
	displayName: "Boost a server",
	getValue: async (client, { msg }) => {
		
		let boosts = await client.SBM.getServerBoosts(msg.guildID);
		return boosts && boosts.length ? `This server has ${boosts.length} boost(s)` : "This server has no boosts! Be the first!";
		// let userData = await client.SQLHandler.genericGet("spousefu", "userid", msg.author.id);
		// if (!userData.started) return "Your adventure has not begun! do `waifu begin` to start";
		// return `Currently in **${userData.boardID}**`;
		// });
	},
	run: (async (client, { msg, params }) => {
		let type;
		//1dayBoosts, 2dayBoosts, 5dayBoosts, 1weekBoosts, 1monthBoosts,
		switch (params[0]) {
		case "1d":
			type = "1dayBoosts";
			break;
		case "2d":
			type = "2dayBoosts";
			break;
		case "5d":
			type = "5dayBoosts";
			break;
		case "1w":
			type = "1weekBoosts";
			break;
		case "1m":
			type = "1monthBoosts";
			break;

		default:
			return "I dont know what type are you talking about";
			// break;
		}
		let res = await client.SBM.boostServer(msg.author.id,msg.guildID,type);
		if (!res || !res.boosted) return `Boost failed! \`\`\`${res? res.reason: "Unknown Error"}\`\`\``;

		return "Boost successful!";
	}),// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});