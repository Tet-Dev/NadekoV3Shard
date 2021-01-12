const ReactionHandler = require("eris-reactions");
const { SettingCommand } = require("eris-boiler/lib");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const moment = require("moment");
module.exports = new SettingCommand({
	name: "list",
	description: "Displays your current Dazai Boost Inventory",
	options: {
		// parameters: [],
		// permission
	},
	displayName: "List Boosts",
	getValue: async (client, { msg }) => {
		// let tradeData = await client.ShopHandler.getAllTrades(msg.author.id);
		let userData = await client.SBM.getUserBoosts(msg.author.id);
		if (!userData) return "Failed to load preview!";
		// userid, 1dayBoosts, 2dayBoosts, 5dayBoosts, 1weekBoosts, 1monthBoosts, autoTakeBoosts
		delete userData.userid;
		delete userData.autoTakeBoosts;
		let unused = Object.values(userData).reduce((accum,val)=>accum+val);
		let boostingServers = await client.SBM.getUserSBoosts(msg.author.id);
		return `${unused} boosts avalible, ${boostingServers.length} currently in use.`;
		// });
	},
	run: (async (client, { msg, params }) => {
		let userData = await client.SBM.getUserBoosts(msg.author.id);
		if (!userData) return "Failed to load preview!";
		// userid, 1dayBoosts, 2dayBoosts, 5dayBoosts, 1weekBoosts, 1monthBoosts, autoTakeBoosts
		delete userData.userid;
		delete userData.autoTakeBoosts;
		// let unused = Object.values(userData).reduce((accum,val)=>accum+val);
		let boostingServers = await client.SBM.getUserSBoosts(msg.author.id);
		let bservers = boostingServers.map(x=>{
			let guild = client.guilds.get(x.guild);
			guild = guild || {name: `Guild with ID: ${x.guild}`};
			return `\`${x.boostID}\` Boost for ${guild.name} ending ${moment(x.expires*1000).fromNow()}`;
		}).join("\n");
		let desc = 
		`__Unused Boosts:__
		${userData["1dayBoosts"] || 0} Single day boosts
		${userData["2dayBoosts"] || 0} Two day boosts
		${userData["5dayBoosts"] || 0} Five day boosts
		${userData["1weekBoosts"] || 0} Single Week boosts
		${userData["1monthBoosts"] || 0} Single Month boosts
		__Active Boosts:__
		${bservers}
		`;
		let embed = {
			title : "Dazai Boosts Inventory",
			description: desc
		};
		return {embed: embed};
	}),// functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});