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
	name: "board",
	description: "Brings up a current board for you to play in !(Note that in dms it cannot unreact for you!)",
	options: {
		optionalParameters: ["pass in `wasd` to activate wasd mode and chaining!(To Escape WASD mode, type `exit`)"],
		// permission
		hidden: true,
	},
	displayName: "Display Board",
	getValue: async (client, { msg }) => {
		let userData = await client.SQLHandler.genericGet("spousefu", "userid", msg.author.id);
		if (!userData.started) return "Your adventure has not begun! do `waifu begin` to start";
		return `Currently in **${userData.boardID}**`;
		// });
	},
	run: (async (client, { msg, params }) => {
		let userData = await client.SQLHandler.genericGet("spousefu", "userid", msg.author.id);
		if (!userData.started) return "Your adventure has not begun! do `waifu begin` to start";
		
		let boardMsg = await client.createMessage(msg.channel.id,{
			content: `Spousefu Board for ${msg.author.id}`,
			embed: {
				description: "Loading Board...",
				fields:[
					{
						name: "Dialog",
						value : "None"
					}
				]
			}
		});
		let a = await client.BoardManager.getData(msg.author.id,boardMsg);
		let embed = boardMsg.embeds[0];
		embed.description = client.BoardManager.visualizeBoard(a.board);
		boardMsg.edit({
			embed:embed
		});
		if (params[0] && params[0] === "wasd"){
			client.BoardManager.addwasdMessage(msg.author.id,boardMsg);
			await msg.channel.createMessage(`Activating WASD Mode for user ${msg.author.mention}!(\`exit\` to exit!)`);
			
		}
		let buttons = ["◀️","🔼","🔽","▶️","🟡"];
		buttons.forEach(x=>boardMsg.addReaction(x));
		
		// reactMSG.addReaction("🔽");
		// let react = await getReaction(reactMSG,msg.author);
		// if (!react) return;
		// reactMSG.edit({
		// 	content: reactMSG.content + "\nTo start off, you are going to need a starter waifu/husbando. I would personally only allow you to pick me, but that would be unfair, so I have to give you some options"
		// })
		//To start off, you are going to need a starter waifu/husbando. I would personally only allow you to pick me, but that would be unfair, so I have to give you some options

	}),// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});