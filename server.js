
const { DataClient } = require("eris-boiler");
const path = require("path");
const { join } = path;
const SQLHandler = require("./handlers/SQLCommunicator");
const MusicHandler = require("./handlers/music");
const requestAPI = require("request");
var SpotifyWebApi = require("spotify-web-api-node");
const PermissionsHandler = require("./handlers/permissionHandler");
const EconomyHandler = require("./handlers/economy");
const LevellingHandler = require("./handlers/levelling");
// const DiscordBotList = require("dblapi.js");
const PunishmentHandler = require("./handlers/punishment");
const ShopHandler = require("./handlers/shopHandler");
const { map } = require("lodash");
const MLHandler = require("./handlers/mlHandler");
const RedditHandler = require("./handlers/redditHandler");
const BoardManager = require("./handlers/waifuwars/boards/boardManager");
const CommandStats = require("./handlers/cmdStats");
const MusicImagery = require("./handlers/musicImageGen.js");
require("dotenv").config({path: path.resolve(process.cwd(), "dazenv")});
const fs = require("fs");//.promises;
const ServerBoostManager = require("./handlers/serverBoostHandler");
const AIManager = require("./handlers/AIHandler");
const RankCardHandler = require("./handlers/RankCards");
const ConvoHandler = require("./handlers/convoHandler");
const fetch = require("node-fetch");
const { color } = require("jimp");
const { default: Axios } = require("axios");
const spotifyApi = new SpotifyWebApi({
	clientId: "21ecf39ff60a471189d5411c37182e31",
	clientSecret: process.env.SPOTIFY_SECRET,
});


Object.defineProperty(Array.prototype, "chunk_inefficient", {
	value: function (chunkSize) {
		var array = this;
		return [].concat.apply([],
			array.map(function (elem, i) {
				return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
			})
		);
	}
});
var LinkMap = new Map();
var ColorMap = new Map();
var WaifuAttacks = new Map();
let shopOffers = [];
const totalShopItems = 5;
function AddAllWaifuAttacks() {
	WaifuAttacks.set("attack", "Just a normal, basic attack thing; Dont mind it. Deals 2 Damage!");
	WaifuAttacks.set("attack2", "Just a normal, basic attack thing; Dont mind it");
}
AddAllWaifuAttacks();
/* create DataClient instance */
const options = {
	oratorOptions: {
		defaultPrefix: "daz" // sets the default prefix to !!
	},
	statusManagerOptions: {
		defaultStatus: { // sets default discord activity
			type: 0,
			name: "daz help | ..."
		},
		mode: "random" // sets activity mode to random, the bot will change status on an interval
	},
	erisOptions: {
		restMode: true,
		defaultImageSize: 256,
		sendIDOnly: true,
		firstShardID: Number(process.env.PROCESSID),
		lastShardID: Number(process.env.PROCESSID),
		maxShards: 2,
	},
};

function refreshSpotify(refresh_token) {
	return new Promise(function (resolve, reject) {
		var authOptions = {
			url: "https://accounts.spotify.com/api/token",
			headers: { "Authorization": "Basic " + (new Buffer("21ecf39ff60a471189d5411c37182e31:547954723aa042568328e5a305741009").toString("base64")) },
			form: {
				grant_type: "refresh_token",
				refresh_token: refresh_token
			},
			json: true
		};

		requestAPI.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token;
				resolve(access_token);
			} else {
				reject("error!");
			}
		});

	});
}

async function refreshSpotifyToken() {
	var nooToken = await refreshSpotify(process.env.SPOTIFY_TOKEN);
	spotifyApi.setAccessToken(nooToken);
	return nooToken;
}
setTimeout(async () => {
	await refreshSpotifyToken();
}, 1000);
// ();
setInterval(refreshSpotifyToken, 900000);
const bot = new DataClient(process.env.BOT_TOKEN, options);
bot.LinkMap = LinkMap;
bot.ColorMap = ColorMap;
bot.shopOffers = shopOffers;
bot.SQLHandler = new SQLHandler(bot);
bot.MusicHandler = new MusicHandler(bot);
bot.permissionsHandler = new PermissionsHandler(bot.SQLHandler, bot);
bot.EconomyHandler = new EconomyHandler(bot);
bot.LevellingHandler = new LevellingHandler(bot);
bot.PunishmentHandler = new PunishmentHandler(bot);
bot.ShopHandler = new ShopHandler(bot);
bot.MLHandler = new MLHandler(bot);
// bot.MLHandler.init();
bot.RedditHandler = new RedditHandler(bot);
bot.RedditHandler.init().catch(er => console.trace(er));
bot.BoardManager = new BoardManager(bot);
bot.CommandStats = new CommandStats(bot);
bot.CommandStats.init();
bot.snipes = new Map();
bot.esnipes = new Map();
bot.RankCardHandler = new RankCardHandler(bot);
bot.simps = ["Axilotl#5827"];
bot.botMasters = ["295391243318591490", "694234706430001222", "678335216154181666"];
bot.reportBlocklist = [];

//Tet , Ollie , Grify
bot.PunishmentHandler.loadPunishments();
bot.SBM = new ServerBoostManager(bot);
bot.AIManager = new AIManager(bot);
bot.ConvoHandler = new ConvoHandler(bot);
let d = new Date();
d.setHours(24, 0, 0, 0);
setTimeout(() => {
	bot.ShopHandler.refreshShops();
	setInterval(() => {
		bot.ShopHandler.refreshShops();
	}, 86400000);
}, d.getTime() - Date.now());
console.log("time till next rstart: ", d.getTime() - Date.now());
bot.spotifyApi = spotifyApi;
bot.MusicImagery = new MusicImagery(bot);
bot.on("error", async (err) => {
	console.trace("Bot Error!", err);
});
bot.on("warn", async (err) => {
	console.trace("Bot Warn!", err);
});
// bot.envVars = fs.readFileSync(".env").toString("utf-8").split(/\r?\n/);
bot.env = process.env;
bot
	.addCommands(join(__dirname, "commands")) // load commands in commands folder
	.addEvents(join(__dirname, "events")) // load events in events folder
	.connect();
bot.on("ready", async () => {
	//
	//
	const commandsBlacklist = ["eval", "reboot"];
	let commands = [];

	Array.from(bot.commands.keys()).forEach((item, ind) => {
		if (commandsBlacklist.includes(item)) {
			return;
		}
		// if (bot.commands[item].hidden) {
		// 	return;
		// }
		let it = bot.commands.get(item);
		if (it.hidden) return;
		let usage = it.parameters && it.parameters.length ? `daz ${item} <code>{${it.parameters.join("}  {")}} ${it.optionalParameters && it.optionalParameters.length ? `[${it.optionalParameters.join("]  [")}]` : ""} </code>` : (it.optionalParameters && it.optionalParameters.length ? `daz ${item} <code>[${it.optionalParameters.join("]  [")}]</code>` : `daz ${item}`);
		let mod = 0;
		// while (usage.search(/```/g) != -1) {

		// 	usage = (mod % 2 == 0 ? usage.replace("```", "<br><code>") : usage.replace("```", "</code>"));
		// 	mod++;
		// }
		commands.push({
			name: item,
			description: it.description,
			usage: usage
		});
		if (!it.subCommands || Array.from(it.subCommands.keys()).length == 0) return;
		Array.from(it.subCommands.keys()).forEach((key, index) => {
			let subit = it.subCommands.get(key);
			usage = subit.parameters && subit.parameters.length ? `daz ${item} ${key} <code>{${subit.parameters.join("}  {")}} ${subit.optionalParameters && subit.optionalParameters.length ? `[${subit.optionalParameters.join("]  [")}]` : ""}</code>` : (subit.optionalParameters && subit.optionalParameters.length ? `daz ${item} <code>[${subit.optionalParameters.join("]  [")}]</code>` : `daz ${item} ${key}`);
			mod = 0;
			commands.push({
				name: `${item} ${key}`,
				description: subit.description,
				usage: usage
			});
		});

	});
	Axios.post("https://api.dazai.app/api/reportShard",{
		token : bot.token,
		guildCount: bot.guilds.size,
		commands: commands,
		perms: bot.permissionsHandler.getallPerms(),
		shard: process.env.PROCESSID,
	});
	setInterval(() => {
		Axios.post("https://api.dazai.app/api/uptimePing",{
			token : bot.token,
			shard: process.env.PROCESSID,
		});
	}, 1000);
	// bot.commands = bot.commands.filter(x=>x.name);
});
const express = require('express');
const server = express();
server.all('/', (req, res)=>{
    res.send('Dazai ping!')
})
server.listen(8000);
console.log("Server is Ready!")
module.exports = ()=>{ server.listen(8000, ()=>{console.log("Server is Ready!")});
};
// const nodeUtil = require('util');
// if (!process.env.APIAUTH){
// 	console.log = async (...data) => {
// 		data = data.map(x=>nodeUtil.inspect(x)).join(" ");
// 		let dataarr = [];
// 		if (data.length >= 2000) {
// 			while (data.length >= 1950) {
// 				dataarr.push(data.substring(0, 1950));
// 				data = data.substring(1950, data.length);
// 			}
// 			dataarr.push(data);

// 		} else {
// 			dataarr.push(data);
// 		}
// 		dataarr = dataarr.filter(x => x);
// 		let msgs = [];
// 		for (let i = 0; i < dataarr.length; i++) {
// 			msgs.push(await bot.executeWebhook("793922460407300137", "ym1l7mb0Q2rDzfCoQGhKkymkTtGsi-LQrygA-FZ7C4hW7dyz4_R3PwrT-Alnjoq-REsC", {
// 				embeds:[
// 					{
// 						description: `${dataarr[i]}`,
// 						color: 0,
// 					}
// 				],
// 				wait: true
// 			}));
// 		}
// 		return msgs;

// 	};
// 	console.error = async (...data) => {
// 		data = data.map(x=>nodeUtil.inspect(x)).join(" ");
// 		let dataarr = [];
// 		if (data.length >= 2000) {
// 			while (data.length >= 1950) {
// 				dataarr.push(data.substring(0, 1950));
// 				data = data.substring(1950, data.length);
// 			}
// 			dataarr.push(data);

// 		} else {
// 			dataarr.push(data);
// 		}
// 		dataarr = dataarr.filter(x => x);
// 		dataarr = dataarr.filter(x => x);
// 		let msgs = [];
// 		for (let i = 0; i < dataarr.length; i++) {
// 			msgs.push(await bot.executeWebhook("793923171056222208", "k5uFpIWB5f7qKcKhe6LCAi0J8H82x6IMtwCcNUlhgejn8fArRZ9w78IuiMaterx0sbo9", {
// 				embeds:[
// 					{
// 						description: `${dataarr[i]}`,
// 						color: 16711680,
// 					}
// 				],
// 				wait: true
// 			}));
// 		}
// 		return msgs;
// 	};
// 	console.warn =async (...data) => {
// 		data = data.map(x=>nodeUtil.inspect(x)).join(" ");
// 		let dataarr = [];
// 		if (data.length >= 2000) {
// 			while (data.length >= 1950) {
// 				dataarr.push(data.substring(0, 1950));
// 				data = data.substring(1950, data.length);
// 			}
// 			dataarr.push(data);

// 		} else {
// 			dataarr.push(data);
// 		}
// 		dataarr = dataarr.filter(x => x);
// 		let msgs = [];
// 		for (let i = 0; i < dataarr.length; i++) {
// 			msgs.push(await bot.executeWebhook("793922856999845928", "dfAtEwk0jYcpXd1Q-Dbw-BbLMviNVyjfKle7EVHkUh-RiawhpZ6sfqkZDdOmKPw_-LAW", {
// 				embeds:[
// 					{
// 						description: `${dataarr[i]}`,
// 						color: 16758784,
// 					}
// 				],
// 				wait: true
// 			}));
// 		}
// 		return msgs;
// 	};
// }
