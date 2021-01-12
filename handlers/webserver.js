/* eslint-disable no-unused-vars */
/* eslint-disable no-inner-declarations */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const axios = require("axios");
const moment = require("moment");
const Eris = require("eris");
const qs = require("querystring");
const ytdl = require("ytdl-core");
const localtunnel = require("@tomasruizr/localtunnel");
const { type } = require("os");
const { default: fetch } = require("node-fetch");
function SecsToFormat(string) {
	let sec_num = parseInt(string, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - hours * 3600) / 60);
	let seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + ":" + minutes + ":" + seconds;
}
function SecsToFormat2(string) {
	let sec_num = parseInt(string, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - hours * 3600) / 60);
	let seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + " Hour(s) " + minutes + " Minute(s) and " + seconds + " Second(s)";
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function genID(length) {
	let result = "";
	let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
let bot;
let app;
let sslOptions;
let server;
let port;
let purchaseQueueHandler = [];
let sqlConnection;
class ExpressServer {
	constructor(b) {
		bot = b;
		sqlConnection = bot.SQLHandler;
		app = express();
		app.use(cors());
		app.use(bodyParser.json());
		sslOptions = {
			key: fs.readFileSync("./keys/private.key", "utf8"),
			cert: fs.readFileSync("./keys/certificate.crt", "utf8")
		};
		app.listen(8080);
		// server = https.createServer(sslOptions, app).listen(process.env.PORT || 8080, function () {
		// 	port = server.address().port;
		// });
		let watchAPI = (async (tunnelURL) => {
			let item = await Promise.race(axios.get("https://api.dazai.app/api/getPerms"), sleep(1000));
			if (!item) {
				//API Must be down
				let start = Date.now();
				await bot.createMessage("793689695380176926", "Bot's API must be down, the request timed out (>1000ms) Resending the data...");
				let attempts = 0;
				while (attempts < 5 && !item) {
					await axios.post("https://api.dazai.app/updatePostURL", {
						url: `${tunnelURL}`,
						auth: process.env.APIAUTH || "5ziej8ixgtmyvbd7nm6bpcab7seaf2zkpue9au25",
					});
					item = await Promise.race(axios.get("https://api.dazai.app/api/getPerms"), sleep(1000));
				}
				if (!item) {
					await bot.createMessage("793689695380176926", `<@&784171795103744010>s, API Issue could not be resolved in ${Date.now() - start}ms, exceeded ${attempts}`);
				} else {
					await bot.createMessage("793689695380176926", `API issue automatically resolved in ${Date.now() - start}ms, (${attempts} tries)`);
				}
			}
		});
		app.post("/api/getGuildStats", async function (req, res) {
			const authToken = req.body.code;
			const guildID = req.body.guildID;
			let failed;
			let selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			}
			let userID = selfRequest.data.id;

			let member = await bot.getRESTGuildMember(guildID, userID);
			(member).permissions.has("manageGuild") || member.owner;
			let gdata = await bot.SQLHandler.getGuild(guildID);
			let boost = (gdata.boosters ? gdata.boosters.split("§") : []);
			boost = boost.sort((f, s) => f.split(",")[1] - s.split(",")[1]);
			boost = boost.map(async (item) => {
				let user = item.split(",");
				let count = user[1];
				let time = user[2] || 33134774400000;

				user = await bot.getRESTUser(user[0]);
				return {
					userOBJ: user,

					boostNum: count,
					timestampEndMs: time,
					endTimeFormat: moment(time).fromNow(),
				};
			});
			let chans = await bot.getRESTGuildChannels(guildID);
			chans = chans.filter(x => !x.type).map(x => {
				return {
					id: x.id,
					name: x.name
				};

			});
			boost = await Promise.all(boost);
			let returnOBJ = {
				boosters: boost,
				level: gdata.premium,
				inviter: gdata.inviter,
				channels: chans,
				messageEventJoinDM: {
					channel: "Dm/None",
					msg: gdata.joindmmsg,

				},
				messageEventJoin: {
					channel: gdata.joinchan,
					msg: gdata.joinmsg,

				},
				messageEventLeave: {
					channel: gdata.leavechan,
					msg: gdata.leavemsg,

				},
				messageEventLevelup: {
					channel: gdata.levelmsgchan,
					msg: gdata.levelmsgs,

				},

			};
			res.status(200).json(returnOBJ);
		});


		app.post("/api/uservote", async (req, res) => {
			let vote = req.body;
			let auth = req.body.auth;
			if (!auth || process.env.DISCORDBOTLIST_AUTH !== auth) res.status(200).json("Auth Keys dont match!");
			if (typeof vote === "string") vote = JSON.parse(vote);
			let amnt = Math.round(Math.random() * 15) + 15;
			let dmChan = await bot.getDMChannel(vote.user);
			await bot.EconomyHandler.addToBal(vote.user, amnt, "Voting!");
			await dmChan.createMessage({
				embed: {
					"title": "Vote Counted",
					"description": "Thank you  for voting for me! As a thanks, I found some coins under my couch. Here you go!",
					"color": 7339933,
					"fields": [
						{
							"name": "Item Get!",
							"value": amnt + " Daz Coin"
						}
					]
				}
			});
			res.status(200).json("Vote Counted!");
		});
		app.post("/api/shop", async function (req, res) {
			const authToken = req.body.code;
			let failed;
			let selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				return res.status(200).json("relog");
			} else {
				let userID = selfRequest.data.id;
				let userBal = await bot.EconomyHandler.getBal(userID);
				let offers = JSON.parse((await bot.ShopHandler.getUserShopItems(userID)).replace(/\n/g, "\\n"));
				res.status(200).json({
					bal: userBal,
					offers: offers,
				});
			}

		});
		app.post("/api/buy-item", async function (req, res) {

			const authToken = req.body.code;
			const buyItem = req.body.item;
			let failed;
			let selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			} else {
				let userID = selfRequest.data.id;
				if (purchaseQueueHandler.includes(userID)) {

					res.status(200).json({ pass: false, reason: "You already have a purchase going through! Please wait!" });
					return;
				}
				purchaseQueueHandler.push(userID);
				let offers = JSON.parse((await bot.ShopHandler.getUserShopItems(userID)).replace(/\n/g, "\\n"));
				let userBal = await bot.EconomyHandler.getBal(userID);
				userBal = userBal.coins;
				let alloffers = offers;
				offers = offers.filter(x => x.idName === buyItem);
				if (offers.length && offers[0].price <= userBal) {
					let userSetRes = await bot.EconomyHandler.takeFromBal(userID, offers[0].price, "Bought **" + offers[0].name + "**");
					if (userSetRes) {
						let user = await bot.getRESTUser(userID);
						let executefu = (await bot.shopOffers.filter(y => y.idName === offers[0].idName)[0].executeFunction(user));
						if (executefu == 0) {
							await bot.EconomyHandler.addToBal(userID, offers[0].price, "Purchase Failed **" + offers[0].name + "**");
							res.status(200).json({ pass: false, reason: "Invalid Offer Purchase, Perhaps you already own the maximum amount of this item?" });
							purchaseQueueHandler = purchaseQueueHandler.filter(x => x !== userID);
						} else {
							let popped = false;
							if (executefu != 2) {
								await sqlConnection.query("UPDATE `nadekoguilddata`.`dazaishop` SET `offers` = \"" + (JSON.stringify(alloffers.filter(x => {
									if (x.idName === buyItem && !popped) {
										popped = true;
										return false;
									}
									return true;
								})).replace(/\"/g, "\\\"")) + "\" WHERE `userid` = '" + userID + "'");
							}

							res.status(200).json({ pass: true, reason: "Purchase Successful!" });
							purchaseQueueHandler = purchaseQueueHandler.filter(x => x !== userID);
						}
					}

				} else {
					res.status(200).json({ pass: false, reason: "Invalid Offer Purchase, perhaps the offers refreshed or you dont have enough of that Daz Coin?(Refresh browser page?)" });
				}
			}

		});
		app.post("/api/set-cust", async function (req, res) {

			const authToken = req.body.code;
			const item = req.body.item;
			let failed;
			let selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			} else {
				let userID = selfRequest.data.id;
				let resp;
				if (item.includes("CS")) {
					resp = await bot.ShopHandler.setCSCust(userID, item);

				} else {
					resp = await bot.ShopHandler.setBGCust(userID, item);
				}
				return res.status(200).json(resp);
			}

		});

		app.get("/api/botstats", function (req, res) {
			res.status(200).json({
				guilds: bot.guilds.size,
				members: bot.users.size,
				uptime: (Math.round(bot.uptime / 1000)),
				shards: bot.shards.size,
				pings: bot.shards.map(x => x.latency),
			});
		});

		app.post("/api/accept-trade", async function (req, res) {
			try {
				let authToken = req.body.code;
				const tradeID = req.body.id;
				let failed;
				let selfRequest = await axios.get(
					"https://discord.com/api/v8/users/@me",
					{
						headers: { "Authorization": "Bearer " + authToken }
					}

				).catch(er => failed = true);
				if (failed) {
					return res.status(200).json("relog");
				} else {
					let userID = selfRequest.data.id;
					let trade = await bot.ShopHandler.getTrade(sqlConnection.clean(tradeID));
					if (trade) {
						if (trade.trader === userID) {
							return res.status(200).json({ failed: true, reason: "You cannot trade with yourself!" });
						}
						if (trade.complete === 0) {
							let inventory = await bot.ShopHandler.getInventory(userID);
							let authorInventory = await bot.ShopHandler.getInventory(trade.trader);
							let giveItems = JSON.parse(trade.tradetake);
							let invMap = inventory.map(x => x.id.toLowerCase());
							function findItem(name, serial) {
								let fil = inventory.filter(x => x.id.toLowerCase() === name.toLowerCase());
								fil = fil.filter(x => (x.serial + "").toLowerCase() === (serial + "").toLowerCase());
								return fil.length > 0 ? true : false;
							}
							if (giveItems.length === giveItems.filter(x => invMap.includes(x.id.toLowerCase()) && (((!x.serial && x.serial !== 0) || findItem(x.id, x.serial)))).length) {
								for (let i = 0; i < giveItems.length; i++) {
									let popped = false;
									let item = await bot.ShopHandler.getItemInfo(giveItems[i].id);
									if (!item.isTradeable) return res.status(200).json({ failed: true, reason: "You have an untradable item in your offer array!" });
									if (typeof giveItems[i].serial === "undefined") {
										inventory = inventory.filter(x => {
											if (x.id.toLowerCase() === giveItems[i].id.toLowerCase() && !popped) { popped = true; return false; }
											return true;

										});
									} else {
										inventory = inventory.filter(x => {
											if (x.id.toLowerCase() === giveItems[i].id.toLowerCase() && !popped && (x.serial + "").toLowerCase() === giveItems[i].serial.toLowerCase()) { popped = true; return false; }

											return true;

										});
									}
									if (popped) {
										authorInventory.push(giveItems[i]);
									}
								}
								inventory = inventory.concat(JSON.parse(trade.tradegive));
								await bot.ShopHandler.setInventory(userID, inventory);
								await bot.ShopHandler.setInventory(trade.trader, authorInventory);
								let usr = await bot.getRESTUser(userID);
								let dmChan = await bot.getDMChannel(trade.trader);
								await sqlConnection.query("UPDATE `nadekoguilddata`.`trades` SET `complete` = '1', `trader2` = '" + usr.id + "' WHERE (`tradeID` = '" + tradeID + "')");
								dmChan.createMessage({
									"content": "",
									"embed":
									{
										"title": "Trade Complete",
										"description": "Hey " + usr.mention + ", your trade with ID " + tradeID + " has been accepted by " + usr.username + "#" + usr.discriminator + "(ID: " + usr.id + ")",
										"color": 8781720,
										"thumbnail": {
											"url": "https://i.imgur.com/IcN63Ln.png"
										}
									}

								});
							} else {
								res.status(200).json({ failed: true, reason: "Your inventory does not have all the sufficent items!" });
							}

						} else {
							res.status(200).json({ failed: true, reason: "Invalid Trade ID! This could be because somebody else completed the trade" });
						}
					} else {
						res.status(200).json({ failed: true, reason: "Invalid Trade ID! This could be because the author of the trade canceled the offer" });
					}
				}
			} catch (error) {
				res.status(200).json({ failed: true, reason: "Error: " + error });
			}
		});
		app.post("/api/get-trade", async function (req, res) {
			try {
				// const authToken = req.body.code;
				const tradeID = req.body.id;
				let trade = await bot.ShopHandler.getTrade(sqlConnection.clean(tradeID));
				if (trade) {

					let user;
					if (trade.anonymous === 1) {
						trade.trader = "Anonymous";
						user = {
							name: "Anonymous#••••",
							avatar: bot.user.dynamicAvatarURL("png", 128),
							id: "••••••••••••••••••"
						};
					} else {
						let tempuser = await bot.getRESTUser(trade.trader);
						user = {
							name: tempuser.username + "#" + tempuser.discriminator,
							avatar: tempuser.dynamicAvatarURL("png", 128),
							id: tempuser.id
						};
					}
					trade.tradetake = await Promise.all(JSON.parse(trade.tradetake).map(async x => {
						return bot.ShopHandler.getItemInfo(x.id);

					}));
					trade.tradegive = await Promise.all(JSON.parse(trade.tradegive).map(async x => {
						if (x.serial || x.serial === 0) {
							let serial = x.serial + "";
							x = await bot.ShopHandler.getItemInfo(x.id);
							x.serial = serial;
						} else {
							x = await bot.ShopHandler.getItemInfo(x.id);
						}


						return x;
					}));
					let user2;
					if (trade.trader2) {
						user2 = await bot.getRESTUser(trade.trader2);
						user2 = {
							name: user2.username + "#" + user2.discriminator,
							avatar: user2.dynamicAvatarURL("png", 128),
							id: user2.id
						};
					}
					res.status(200).json({
						user: user,
						user2: user2,
						trade: trade
					});
				} else {
					res.status(200).json(null);
				}

			} catch (error) {
				res.status(200).json({ failed: true, reason: "error " + error });
			}
		});
		app.post("/api/generateMusicCard", async (req, res) => {
			const authToken = req.body.auth;
			const startTime = req.body.startTime;
			const song = req.body.song;
			const guildID = req.body.guild;
			const channelID = req.body.channel;
			const whoPlayed = req.body.whom;
			if (!authToken || authToken !== bot.token){
				res.status(200).json("Incorrect Auth!");
				return;
			}
			let songData = await ytdl.getInfo(song);
			
			bot.MusicImagery.createRequest(songData,startTime,guildID,channelID,"unknown");
			res.status(200).json("Sent!");
		});
		app.post("/api/generateStartPlayMusicCard", async (req, res) => {
			console.log("a");
			const authToken = req.body.auth;
			const queue = req.body.queue;
			const song = req.body.song;
			const guildID = req.body.guild;
			const channelID = req.body.channel;
			const whoPlayed = req.body.whom;
			if (!authToken || authToken !== bot.token){
				res.status(200).json("Incorrect Auth!");
				return;
			}
			// let songData = await ytdl.getInfo(song);
			
			bot.MusicImagery.nextUp(song,whoPlayed,guildID,channelID,queue);
			res.status(200).json("Sent!");
		});
		app.post("/api/create-trade", async function (req, res) {
			try {
				const authToken = req.body.code;
				const giveItems = req.body.give;
				const wantItems = req.body.want;
				let failed;
				let selfRequest = await axios.get(
					"https://discord.com/api/v8/users/@me",
					{
						headers: { "Authorization": "Bearer " + authToken }
					}

				).catch(er => failed = true);
				if (failed) {
					return res.status(200).json("relog");
				} else {
					let userID = selfRequest.data.id;
					let trades = await bot.ShopHandler.getAllTrades(userID);
					if (trades.filter(x => x.complete === 0).length >= 2) {
						res.status(200).json({ failed: true, reason: "You already have 2 or more trades active. Free members get only two concurrent trades." });
						return;
					}
					//verify the legitness of giveItems
					let inv = await bot.ShopHandler.getInventory(userID);
					let invMap = inv.map(x => x.id.toLowerCase());
					// eslint-disable-next-line no-inner-declarations
					function findItem(name, serial) {
						let fil = inv.filter(x => x.id.toLowerCase() === name.toLowerCase());
						fil = fil.filter(x => (x.serial + "").toLowerCase() === (serial + "").toLowerCase());
						return fil.length > 0 ? true : false;
					}
					if (giveItems.length === giveItems.filter(x => invMap.includes(x.id.toLowerCase()) && (((!x.serial && x.serial !== 0) || findItem(x.id, x.serial)))).length) {

						for (let i = 0; i < giveItems.length; i++) {
							let popped = false;
							let item = await bot.ShopHandler.getItemInfo(giveItems[i].id);
							if (!item.isTradeable) return res.status(200).json({ failed: true, reason: "You have an untradable item in your offer array!" });
							if (typeof giveItems[i].serial === "undefined") {
								inv = inv.filter(x => {
									if (x.id.toLowerCase() === giveItems[i].id.toLowerCase() && !popped) { popped = true; return false; }
									return true;

								});
							} else {
								inv = inv.filter(x => {
									if (x.id.toLowerCase() === giveItems[i].id.toLowerCase() && !popped && (x.serial + "").toLowerCase() === giveItems[i].serial.toLowerCase()) { popped = true; return false; }

									return true;

								});
							}
						}
						for (let a = 0; a < wantItems.length; a++) {
							let item = (await bot.ShopHandler.getItemInfo(wantItems[a].id));
							if (!item) res.status(200).json({ failed: true, reason: "Invalid Item requested." });
							if (!item.isTradeable) res.status(200).json({ failed: true, reason: "Invalid Item requested." });
						}
						await bot.ShopHandler.setInventory(userID, inv);
						let tradeID = genID(12);
						await sqlConnection.query("INSERT INTO `nadekoguilddata`.`trades` (`tradeID`, `tradegive`, `tradetake`, `trader` , `anonymous`) VALUES ('" + tradeID + "', '" + JSON.stringify(giveItems) + "', '" + JSON.stringify(wantItems) + "', '" + userID + "','" + (req.body.anon ? "1" : "0") + "')");
						res.status(200).json({ tradeID: tradeID });
						let chan = await bot.getDMChannel(userID);
						chan.createMessage({
							embed: {
								"title": "Trade Created!",
								"description": "Congrats <@!" + userID + ">, You have just created a trade. your trade link is https://dazai.app/trade?id=" + tradeID + " . Please note to only share this link to whom you want to trade with as the trade can be accepted by anyone who wishes to",
								"color": 7208837,
								"thumbnail": {
									"url": "https://i.imgur.com/mm0bIxM.png"
								}
							}
						});
					} else {
						res.status(200).json({ failed: true, reason: "Your trade contains some items you dont seem to have..." });
						return;
					}

				}
			} catch (er) { console.trace(er); res.status(200).json({ failed: true, reason: "An error occured while trying to process your trade. Error: " + er }); }
		});
		app.post("/api/getInventory", async function (req, res) {
			try {
				const authToken = req.body.code;

				let failed;
				let selfRequest = await axios.get(
					"https://discord.com/api/v8/users/@me",
					{
						headers: { "Authorization": "Bearer " + authToken }
					}

				).catch(er => failed = true);
				if (failed) {
					res.status(200).json("relog");
					return;
				} else {
					let userID = selfRequest.data.id;
					let allItems = await bot.ShopHandler.getAllItems();
					let inv = await bot.ShopHandler.getInventory(userID);
					let prefs = await bot.LevellingHandler.getStylePrefs(userID);
					res.status(200).json({
						currentBG: prefs ? prefs.personalbg : null,
						currentCS: prefs ? prefs.personalcolor : null,
						allItems: allItems,
						inventory: inv
					});

				}
			}

			catch (error) {
				res.status(200).json("a");
			}

		});
		let CachedCommands;
		const commandsBlacklist = ["eval", "reboot"];
		app.get("/api/getPerms", function (req, res) {
			res.status(200).json(bot.permissionsHandler.getallPerms());
		});
		app.get("/api/getCommands", function (req, res) {
			let commands;
			if (CachedCommands) {
				commands = CachedCommands;
			} else {
				commands = [];

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
				CachedCommands = commands;
			}
			res.status(200).json(commands);
		});
		app.post("/api/getguilds", async function (req, res) {

			const authToken = req.body.code;
			let failed = false;
			let selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me/guilds",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			}
			let guilds = bot.guilds.filter(x => true).concat(bot.unavailableGuilds.map(x => x.id));
			selfRequest = selfRequest.data;
			selfRequest = selfRequest.filter((x) => {
				let perm = new Eris.Permission(x.permissions);
				return perm.has("manageGuild") || x.owner;
			});
			let ids = selfRequest.map(item => item.id);
			let sharedGuilds = ids.map(id => bot.guilds.get(id) || bot.unavailableGuilds.get(id) || { none: true, id: id, icon: selfRequest.filter(x => x.id === id)[0].icon, name: selfRequest.filter(x => x.id === id)[0].name });
			let nonSharedGuilds = sharedGuilds.filter(x => x.none);
			// nonSharedGuilds = selfRequest.filter(x=>nonSharedGuilds.includes(x.id));
			sharedGuilds = sharedGuilds.filter((x) => !x.none);
			nonSharedGuilds = nonSharedGuilds.map((x) => {
				return {
					name: x.name,
					pfp: (x.icon ? "https://cdn.discordapp.com/icons/" + x.id + "/" + x.icon + ".png?size=" : "https://cdn.discordapp.com/avatars/747901310749245561/303e01fe1c009274ee37521ca47d74e6.png?size="),
					id: x.id,
				};
			});
			sharedGuilds = sharedGuilds.map((x) => {
				return {
					name: x.name,
					pfp: (x.iconURL ? x.iconURL.replace(".png?size=256", ".png?size=").replace(".jpg?size=256", ".png?size=").replace(".gif?size=256", ".png?size=") : undefined) || "https://cdn.discordapp.com/avatars/747901310749245561/303e01fe1c009274ee37521ca47d74e6.png?size=",
					id: x.id,

				};
			});
			res.status(200).json({
				guildsBot: sharedGuilds,
				guildsNotBot: nonSharedGuilds,
			});

		});
		/*  "/api/contacts/:id"
		*    GET: find contact by id
		*    PUT: update contact by id
		*    DELETE: deletes contact by id
		*/
		app.use(express.static("uptimeTest"));
		app.post("/api/getchannels/", async function (req, res) {
			const guildID = req.body.guild;
			const authToken = req.body.code;
			let failed = false;
			const selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			}
			if (!guildID) {
				res.status(750);
				return;
			}
			let chans = await bot.getRESTGuildChannels(guildID);
			chans = chans.filter(x => x.type != 4);
			let channelPush = [];
			let done = 0;
			await chans.forEach(async (chan, index, arr) => {
				let dat;
				let StupidlyLongArrNameSoIDontReuseIt;
				done++;
				if (chan.type == 0) {

					dat = await sqlConnection.query("SELECT * FROM nadekoguilddata.channeldata WHERE channelID = \"" + chan.id + "\"");

					StupidlyLongArrNameSoIDontReuseIt = (await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`disabledcmds` WHERE channelID = '" + chan.id + "'"))[0];



				}
				channelPush.push({
					channelName: chan.name,
					type: (chan.type == 0 ? "Text" : "Voice"),
					disabledcmds: (StupidlyLongArrNameSoIDontReuseIt && StupidlyLongArrNameSoIDontReuseIt.disabledcmds && StupidlyLongArrNameSoIDontReuseIt.disabledcmds.length > 1 ? StupidlyLongArrNameSoIDontReuseIt.disabledcmds.split(",").length : "None"),
					aimod: (dat && dat.ai_on ? "Active" : "Off"),
					chanid: chan.id,
					guildName: chan.guild.name
				});
				done--;
			});
			while (done > 0) {
				await sleep(250);
			}

			res.status(200).json(channelPush);
		});
		app.post("/api/contacts", function (req, res) {
		});
		app.post("/api/getChannelInfo", async function (req, res) {
			const authToken = req.body.code;
			const channelID = req.body.channel;
			let failed = false;
			const selfRequest = await axios.get(
				"https://discord.com/api/v8/users/@me",
				{
					headers: { "Authorization": "Bearer " + authToken }
				}

			).catch(er => failed = true);
			if (failed) {
				res.status(200).json("relog");
				return;
			}

			let tempchan = bot.getChannel(channelID) || await bot.getRESTChannel(channelID);
			// tempchan =  tempchan;
			let aiMod;
			let reros;
			let disabledcmds;
			let guild = tempchan.guild;
			let member = await bot.getRESTGuildMember(guild.id, selfRequest.data.id);
			if (!await bot.permissionsHandler.checkForPerm(member, "administrator")) {
				return res.status(200).json("relog");
			}
			let StupidlyLongArrNameSoIDontReuseIt = (await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`disabledcmds` WHERE channelID = '" + channelID + "'"))[0];
			disabledcmds = (StupidlyLongArrNameSoIDontReuseIt && StupidlyLongArrNameSoIDontReuseIt.disabledcmds ? StupidlyLongArrNameSoIDontReuseIt.disabledcmds : []);
			let disabledcmdsFormatted = Object.keys(bot.commands).map((item, ind) => {
				// if (bot.commands[item].hidden) {
				// 	return;
				// }
				if (disabledcmds.includes(item)) {
					return {
						name: item,
						disabled: true
					};
				}
				return {
					name: item,
					disabled: false
				};
			});
			disabledcmdsFormatted = disabledcmdsFormatted.filter(x => x);
			disabledcmdsFormatted.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			let dat = await sqlConnection.query("SELECT * FROM nadekoguilddata.channeldata WHERE channelID = \"" + channelID + "\"");
			if ((!dat || !dat[0]) || (!dat[0].ai_on)) {
				aiMod = {
					on: false,
					exempts: [],
				};
			} else {
				let allows = [];
				let denys = [];
				let mods = ["racism", "toxicity", "advert", "homophobia", "nsfw"];
				for (let i = 0; i < mods.length; i++) {
					if (dat[0].aitags.split(",").includes(mods[i])) {
						denys.push(mods[i]);
					} else {
						allows.push(mods[i]);
					}
				}
				aiMod = {
					on: true,
					exempts: denys,
					sense: dat[0].strictness
				};
			}



			let gdata = await sqlConnection.getGuild(guild.id);
			if (gdata.reactionroles == null) {
				gdata.reactionroles = "";
			}
			let found = false;
			let allReros = gdata.reactionroles.split("|");
			allReros = allReros.filter((x) => x.length > 2);
			allReros = allReros.map((item, ind) => {
				let emoot;
				let channelid = item.split("§");
				let msgid = channelid[1];
				channelid = channelid[0];
				let roleid = item.split(",")[2];
				if (item.includes("<:")) {
					emoot = "https://cdn.discordapp.com/emojis/" + item.split(":")[2].split(">")[0] + ".png";
				} else {
					emoot = item.split(",")[1];
				}

				let rolename = (tempchan && tempchan.guild.roles.filter((x) => x.id === roleid)[0] ? tempchan.guild.roles.filter((x) => x.id === roleid)[0].name : "N/A");
				return {
					emote: emoot,
					channel: channelid,
					msg: msgid.split(",")[0],
					role: rolename,
					roleid: roleid
				};
				//|739559911150583820§742171996661612565,✅,739559911096057920|739559911150583820§742171996661612565,📰,739559911096057918|739559911150583820§742171996661612565,🗳️,739559911096057919|739559911150583820§742171996661612565,🍿,739559911096057921|739559911150583820§742171996661612565,😳,739559911096057922|739559911150583820§742171996661612565,🖥️,742172387478470736|739559911150583820§742171996661612565,🧠,739559911033405598|739559911150583820§754826617406095491,<:KenjiThink:756613669990695094>,754825149307682922|739559911150583820§754826617406095491,<:NadThink:754826341219696800>,754825149307682922|739559911150583820§762106526135353354,🧠,762106028098584627
			});
			res.status(200).json({
				chanName: tempchan.name,
				aiMod: aiMod,
				reros: allReros.filter(x => x.channel === tempchan.id),
				disabledcmds: disabledcmdsFormatted
			});
		});
		app.post("/api/login", async function (req, res) {
			const loginToken = req.body.code;
			const loginURL = req.body.url;
			if (!loginToken) {
				return res.status(200).json("relog");
			} else {
				let accessToken = await axios.post("https://discord.com/api/v8/oauth2/token",
					qs.stringify({
						client_id: "747901310749245561",
						client_secret: "PGDxNv52U01aaetRkSdZrnEZ8u-XRp_b",
						grant_type: "authorization_code",
						code: loginToken,
						redirect_uri: loginURL || "https://dazai.app/panel/login.html",
						scope: "identify",
					}),
					{
						"Content-Type": "application/x-www-form-urlencoded"
					}

				).catch(er => res.status(401));
				if (accessToken && accessToken.data && accessToken.data.access_token) {
					let accToken = accessToken.data.access_token;
					let refToken = accessToken.data.refresh_token;

					const selfRequest = await axios.get(
						"https://discord.com/api/v8/users/@me",
						{
							headers: { "Authorization": "Bearer " + accToken }
						}

					).catch(er => { });
					let dazResponse = {
						authToken: accToken,
						refToken: refToken,
						username: selfRequest.data.username + "#" + selfRequest.data.discriminator,
						avatar: "https://cdn.discordapp.com/avatars/" + selfRequest.data.id + "/" + selfRequest.data.avatar + ".png?size="

					};

					res.status(200).json(dazResponse);
				} else {
					return res.status(200).json("relog");
				}



			}
		});


	}
	handleError(res, reason, message, code) {

		res.status(200).json({ "error": message });
	}
	kill() {
		server.close();
	}

}
module.exports = ExpressServer;