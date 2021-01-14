
const ytdl = require("ytdl-core");
const axios = require("axios");
const { spawn, fork } = require("child_process");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function SecsToFormat(string) {
	var sec_num = parseInt(string, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;

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
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
let cp;
let songqueue;
let npMaps = new Map();
class MusicHandler {
	constructor(bot) {
		this.bot = bot;
		this.handler = new Map();
		this.songCache = new Map();
		this.YoutubeCookies = process.env.YoutubeCookies;
		this.YoutubeCookies2 = process.env.YoutubeCookies2;
		console.log(this.YoutubeCookies);
		// this.YoutubeCookies2 = this.YoutubeCookies;
		this.ready = false;
		// this.npMaps = new Map();
		this.init();
	}
	async processMessage(msg) {
		console.log(msg);
		npMaps.get(msg.key)(msg.path);
		npMaps.delete(msg.key);
	}
	async sendMessage(data) {
		let key = genID(10);

		data[0].key = key;
		cp.send(JSON.stringify(data));
		return new Promise((res, rej) => {
			npMaps.set(key, res);
		});

	}
	async init() {
		// cp = await fork("./handlers/nowPlaying.js");
		// cp.on("message", this.processMessage);
		// cp.stderr.on("data", x => console.log(x));
		this.ready = true;
	}
	async queueSong(guildID, songLink, messageChannelBound, connection, silentAdd, mem) {
		let msg = guildID;
		guildID = guildID.guildID;
		try {
			// console.log("queueing song");
			if (!this.handler.has(guildID)) this.handler.set(guildID, {
				channel: messageChannelBound,
				queue: [],
				skips: [],
				connection: connection,
				currentSongStartTime: 0,
				currentsong: songLink,
				loop: false,
			});
			let data = this.handler.get(guildID);
			let basicInfo = await this.checkCacheFor(songLink).catch(er => { });
			if (!basicInfo) {
				return false;
			}
			this.songCache.set(songLink, basicInfo);
			let title = basicInfo.videoDetails.title;
			// connection = this.bot.voiceConnections.filter(x=>x.id+"" === guildID)[0];
			// if (!connection){
			// 	return;
			// }

			if ((connection ? connection : data.connection).playing) {
				data.queue.push({
					userAdded: msg.member,
					song: songLink,
				}
				);
				this.handler.set(guildID, data);
				if (!silentAdd) data.channel.createMessage("Added `" + title + "` to the Queue!");
				return;
			}
			let stream = ytdl(songLink, {
				highWaterMark: 1024 * 1024,
				quality: "highestaudio",
				requestOptions: {
					headers: {
						cookie: this.bot.ytCookies[Math.round(Math.random() * 100) % this.bot.ytCookies.length],
					},
				},
			});
			// stream._readableState.needReadable = false;
			// connection.play("./moonLight.mp4");
			// connection.stopPlaying();
			while (!connection.ready && typeof connection.ready !== "undefined") {
				await (10);
			}
			// console.log("Connection Ready!");
			// connection.play("./assets/moonLight.mp4");
			// await sleep(750);
			// connection.stopPlaying();
			this.bot.voiceConnections.filter(x => x.id + "" === guildID)[0].play(stream);
			if (!mem) {
				(connection ? connection : data.connection).on("error", (x) => console.trace(x));
				(connection ? connection : data.connection).on("disconnect", async () => {
					await this.removeQueue(guildID, "all").catch(er => { });
				});
			}
			if (!mem) mem = msg.member;
			let dat2 = axios.post("https://api.dazai.app/api/generateStartPlayMusicCard", {
				auth: this.bot.token,
				queue: data.queue.map(x => x.song),
				song: songLink,
				guild: msg.guildID,
				channel: msg.channel.id,
				whom: `${(mem.nick || mem.user.username)}#${mem.user.discriminator}`,
			}).catch(er => { });
			console.log({
				auth: this.bot.token,
				queue: data.queue.map(x => x.song).filter((x, index) => index < 3),
				song: songLink,
				guild: msg.guildID,
				channel: msg.channel.id,
				whom: `${(mem.nick || mem.user.username)}#${mem.user.discriminator}`,
			});
			// data.channel.createMessage("Now Playing `" + title + "` !");
			data.currentsong = {
				userAdded: msg.member,
				song: songLink,
			};
			data.currentSongStartTime = Math.floor((new Date()).getTime() / 1000);
			this.handler.set(guildID, data);
			// connection.once("error", (x) => console.trace(x));
			// connection.once("disconnect",async ()=>{
			// 	await this.removeQueue(guildID,"all");
			// })
			(connection ? connection : data.connection).once("end", async () => {
				console.log("song ended",connection.ready);
				if (!connection.ready) return data.channel.createMessage("Bot got kicked out!"); 
				try {
					data = this.handler.get(guildID);
					data.skips = [];
					//  = "";
					if (data.loop) data.queue.push(data.currentsong);
					data.currentsong = null;
					if (data.queue.length > 0) {
						let dq = data.queue.shift();
						await this.queueSong(msg, dq.song, messageChannelBound, connection, false, dq.userAdded).catch(er => { });
						this.handler.set(guildID, data);
					} else {
						data.channel.createMessage("Queue Finished!");
						this.handler.delete(guildID);
					}
				} catch (error) {
					console.trace(error,"Error");
				}

			});
		} catch (er) { console.trace(er); }

	}
	async queueArray(guildID, songArr, connection, messageChannelBound, silentAdd) {

		await this.queueSong(guildID, songArr.shift(), messageChannelBound, connection, silentAdd).catch(er => { });
		let data = this.handler.get(guildID.guildID);
		data.queue = data.queue.concat(songArr.map(x => {
			return {
				song: x,
				userAdded: guildID.member,
			};
		}));
		for (let i = 0; i < songArr.length; i++) {
			await this.checkCacheFor(songArr[i]).catch(er => { });
		}
		// songArr.forEach(x => {
		// 	this.checkCacheFor(x);
		// });
		this.handler.set(guildID.guildID, data);
		data.channel.createMessage("Added `" + (songArr.length + 1) + "` songs into the queue.");
	}
	getCurrentSong(guildID) {

		let data = this.handler.get(guildID);
		if (!data || !data.currentsong) return null;
		// console.log(data.currentsong)
		// return [data.currentsong.song, data.currentSongStartTime,data.currentsong.userAdded.username];
		return [data.currentsong.song, data.currentSongStartTime];
	}
	toggleLoop(guildID) {
		let data = this.handler.get(guildID);
		let res = !data.loop;
		data.loop = res;

		this.handler.set(guildID, data);

		return res;
	}
	async addUserSkip(guildID, userID) {
		let failed = false;
		let data = this.handler.get(guildID);
		if (!data) return "Nothing Playing???";
		let chans = this.bot.getChannel(data.connection.channelID);
		if (failed) return "Could not fetch Channel!";
		let mems = chans.voiceMembers.filter(x => !x.bot);
		let map = mems.map(x => x.id);
		if (!map.includes(userID)) return "You must be in the channel to VoteSkip";
		data.skips = data.skips.filter(x => map.includes(x) && x !== userID);
		data.skips.push(userID);
		this.handler.set(guildID, data);
		if (data.skips.length > (map.length + 1) / 2 || map.length == 1) {
			setTimeout(() => {
				this.skipSong(guildID);
			}, 500);

			return data.skips.length + " out of " + map.length + " would like to skip. Skipping...";
		}
		return data.skips.length + " out of " + map.length + " would like to skip. " + Math.ceil((map.length + 1) / 2) + " must agree to skip to skip!\n*Tip: Trying to Force-Skip a song? try `fs` instead!*";


	}
	async skipSong(guildID) {
		this.handler.get(guildID).connection.stopPlaying();
	}
	async getData(guildID) {
		return this.handler.get(guildID);
	}
	async getQueue(guildID) {
		let data = this.handler.get(guildID);
		if (!data) return [];
		let queue = [];
		for (let i = 0; i < data.queue.length; i++) {
			queue.push(await this.checkCacheFor(data.queue[i].song).catch(er => { }));
		}
		// let queue = await Promise.all(data.queue.map(async (x) => await this.checkCacheFor(x)));
		return queue.map((x, ind) => {
			return {
				"name": x.videoDetails.title || "UNKNOWN",
				"value": "#" + (ind + 1) + " | Length: " + SecsToFormat((x.videoDetails.lengthSeconds || 0) + "") + " | [Link](" + data.queue[ind].song + ") | Requested by" + (data.queue[ind].userAdded.nick || data.queue[ind].userAdded.user.username) + "#" + data.queue[ind].userAdded.user.discriminator
			};

		}).filter(x => x);

	}
	async removeQueue(guildID, ind) {
		let data = this.handler.get(guildID);
		let pop;
		if (ind.toLowerCase() === "all") {
			data.queue = [];

		} else {
			pop = await this.checkCacheFor(data.queue.splice(ind - 1, 1)[0].song).catch(er => { });

		}

		this.handler.set(guildID, data);
		return pop;
	}
	async checkCacheFor(item) {
		let basicInfo = this.songCache.get(item);
		let attempts = 0;
		while ((!basicInfo || !basicInfo.videoDetails) && attempts < 10) {
			attempts++;
			await sleep(500);
			basicInfo = await ytdl.getInfo(item,
				{
					requestOptions: {
						headers: {
							cookie: this.bot.ytCookies[Math.round(Math.random() * 100) % this.bot.ytCookies.length],
						},
					},
				}
			).catch(er => console.trace(er));

		}
		if (!basicInfo) {
			return false;
		}
		this.songCache.set(item, basicInfo);
		return basicInfo;
	}
	// as
	clearCache() {
		this.songCache.clear();
	}
}
module.exports = MusicHandler;