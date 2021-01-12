
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
			name: "daz help | Working on uptime + AI!"
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
const RarityColors = {
	common: [150, 150, 150],
	rare: [102, 207, 255],
	super_rare: [135, 255, 159],
	uber: [230, 169, 255],
	legendary: [255, 204, 0],
	event: [-1, -1, -1],

};
// addtoArr(commonWeight.weight, "common");
// addtoArr(rareWeight.weight, "rare");
// addtoArr(superRareWeight.weight, "super_rare");
// addtoArr(uberRareWeight.weight, "uber");
// addtoArr(legendaryWeight.weight, "legendary");
//Inits arrs
(() => {
	shopOffers.push({
		idName: "persona3anime",
		img: ("./assets/dazaiJimp/shop/persona3anime.png"),
		name: "Persona Background",
		rarity: "Common",
		color: RarityColors.common,
		price: 250,
		fullImg: "https://dazai.app/assets/img/Persona3Anime.png",
		lore: "A card background from Persona 3...",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "persona3anime", false);
		})
	});
	shopOffers.push({
		idName: "shirongnl",
		img: ("./assets/dazaiJimp/shop/shirongnl.png"),
		name: "Shiro Background",
		rarity: "Common",
		color: RarityColors.common,
		price: 250,
		lore: "A card background from No Game No Life...\nGive ngnl an S2",
		fullImg: "https://dazai.app/assets/img/shiro.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "shirongnl", false);
		})
	});
	shopOffers.push({
		idName: "dazai1mboost",
		img: ("./assets/dazaiJimp/tet.png"),
		name: "Dazai Boost (1Mo)",
		rarity: "Rare",
		color: RarityColors.rare,
		price: 1250,
		lore: "A Dazai Server Boost for any server of your liking! ",
		fullImg: "https://raw.githubusercontent.com/icedTet/icedTet.github.io/master/otherAssets/unknown.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "shirongnl", false);
		})
	});
	shopOffers.push({
		idName: "Eve-ning",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Eve-ning",
		rarity: "Rare",
		color: RarityColors.rare,
		price: 750,
		lore: "Eve album cover in a evening. Haha, get it?",
		fullImg: "https://dazai.app/assets/img/eve-ning.jpg",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "eve-ning", false);
		})
	});
	shopOffers.push({
		idName: "animenight1",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Anime Night 1",
		rarity: "Rare",
		color: RarityColors.rare,
		price: 850,
		lore: "Background from Bungo Stray Dogs.",
		fullImg: "https://dazai.app/assets/img/bg.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "animenight1", false);
		})
	});
	shopOffers.push({
		idName: "demonslayer1",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Demon Slayer 1",
		rarity: "Rare",
		color: RarityColors.rare,
		price: 1000,
		lore: "Background from Demon Slayer.",
		fullImg: "https://dazai.app/assets/img/ds.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "demonslayer1", false);
		})
	});
	shopOffers.push({
		idName: "luckyDraw",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Lucky Draw",
		rarity: "Common",
		color: RarityColors.common,
		price: 30,
		lore: "Lucky Draw allows you to refresh your shop and get new offers (Or end up with the same offers if you are unlucky)!",
		fullImg: "https://raw.githubusercontent.com/icedTet/icedTet.github.io/master/otherAssets/unknown.png",
		executeFunction: (async (user) => {
			await refreshUserShop(user.id);
			return 2;
		})
	});
	shopOffers.push({
		idName: "superLuckyDraw",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Special Draw",
		rarity: "Rare",
		color: RarityColors.rare,
		price: 50,
		lore: "Special Draw allows you to refresh your shop and get new, non duplicate offers (Each slot will have 3 chances to get a unique item, if all three chances fail, the slot wont exist)!",
		fullImg: "https://raw.githubusercontent.com/icedTet/icedTet.github.io/master/otherAssets/unknown.png",
		executeFunction: (async (user) => {
			await refreshUserShop(user.id, null, true, [], 0);
			return 2;
		})
	});
	shopOffers.push({
		idName: "ani_galaxy",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Red Galaxy",
		rarity: "Uber",
		color: RarityColors.uber,
		price: 5000,
		lore: "The very first gif background in Dazai!",
		fullImg: "https://dazai.app/assets/img/ani_galaxy.gif",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "ani_galaxy", false);

		})
	});
	shopOffers.push({
		idName: "dazai",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Dazai",
		rarity: "Rare",
		color: RarityColors.rare,

		price: 1250,
		lore: "A Background card all about me! 😎\nCosts more than your typical card background because I need to pay a beautiful lady to double suicide with me! ",
		fullImg: "https://dazai.app/assets/img/dazai.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "dazai", false);
		})
	});
	shopOffers.push({
		idName: "agency",
		img: ("./assets/dazaiJimp/shop/eve-ning.jpg"),
		name: "Armed Detective Agency (EVENT ITEM)",
		rarity: "Super_Rare",
		color: RarityColors.event,
		price: 25,
		lore: "A Background card all with me and my collegues as a thank you for me finally getting verified! Avalible for 25 DC until December 1st! ( detective_agency ). Serialized!",
		fullImg: "https://dazai.app/assets/img/detectiveAgency.png",
		executeFunction: (async (user) => {
			return UserUnlock(user.id, "detective_agency", false, true);
		}),
		nodraw: true,
	});
	LinkMap.set("nadekomedusa", "./assets/DazaiBgs/nadekomedusa.png");
	LinkMap.set("renainadeko", "./assets/DazaiBgs/renainadeko.png");
	LinkMap.set("red", "./assets/DazaiBgs/red.png");
	LinkMap.set("orange", "./assets/DazaiBgs/orange.png");
	LinkMap.set("yellow", "./assets/DazaiBgs/yellow.png");
	LinkMap.set("green", "./assets/DazaiBgs/green.png");
	LinkMap.set("blue", "./assets/DazaiBgs/blue.png");
	LinkMap.set("purple", "./assets/DazaiBgs/purple.png");
	LinkMap.set("spacegray", "./assets/DazaiBgs/spacegray.png");
	LinkMap.set("silver", "./assets/DazaiBgs/silver.png");
	LinkMap.set("rainbowfoil", "./assets/DazaiBgs/rainbowfoil.png");
	LinkMap.set("evenight", "./assets/DazaiBgs/evenight.png");
	LinkMap.set("eve-ning", "./assets/DazaiBgs/eve-ning.jpg");
	LinkMap.set("animenight1", "./assets/DazaiBgs/animenight1.png");
	LinkMap.set("demonslayer1", "./assets/DazaiBgs/demonslayer1.png");
	LinkMap.set("persona3anime", "./assets/DazaiBgs/persona3anime.png");
	LinkMap.set("shirongnl", "./assets/DazaiBgs/shirongnl.png");
	LinkMap.set("berry_pink", "./assets/DazaiBgs/berry_pink.png");
	LinkMap.set("ocean_blue", "./assets/DazaiBgs/ocean_blue.png");
	LinkMap.set("honey_yellow", "./assets/DazaiBgs/honey_yellow.png");
	LinkMap.set("test", "./assets/DazaiBgs/test.png");
	LinkMap.set("dazai", "./assets/DazaiBgs/dazai.png");
	LinkMap.set("detective_agency", "./assets/DazaiBgs/detectiveAgency.png");
	LinkMap.set("ani_galaxy", "./assets/DazaiBgs/ani_galaxy.gif");
	LinkMap.set("ani_shelter", "./assets/DazaiBgs/ani_shelter.gif");
	LinkMap.set("ani_demonslayer", "./assets/DazaiBgs/ani_demonslayer.gif");
	LinkMap.set("ani_dazai", "./assets/DazaiBgs/ani_dazai.gif");

	ColorMap.set("red", [208, 33, 33]);
	ColorMap.set("yellow", [237, 230, 12]);
	ColorMap.set("cyan", [0, 200, 200]);
	ColorMap.set("blue", [12, 68, 237]);
	ColorMap.set("black", [20, 20, 20]);
	ColorMap.set("white", [235, 235, 235]);

})();
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
const express = require("express");
const server = express();
server.all("/", (req, res)=>{
	res.send("Dazai ping!");
});
server.listen(3000);
console.log("Server is Ready!");
module.exports = ()=>{ server.listen(3000, ()=>{console.log("Server is Ready!");});
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
