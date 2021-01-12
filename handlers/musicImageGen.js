const ytdl = require("ytdl-core");
const { spawn, fork } = require("child_process");
// const { start } = require("repl");
const { promises } = require("fs");
let npMaps = new Map();
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
let upNext;
let upNextMaps = new Map();
class MusicImagery {
	constructor(bot) {
		this.bot = bot;
		this.init();
		// this.requests = new Map();
	}
	async init() {
		cp = await fork("./handlers/musicHelpers/nowPlaying.js");
		cp.on("message", this._handleReqs);
		cp.on("error", x => console.log(x));
		upNext = await fork("./handlers/musicHelpers/upNext.js");
		upNext.on("message", this._handleNextUp);
		upNext.on("error", x => console.log(x));
	}
	async _handleReqs(msg) {
		console.log(msg);
		if (!msg.key) return;
		npMaps.get(msg.key)(msg.path);
		npMaps.delete(msg.key);
	}
	async _handleNextUp(msg) {
		// console.log(msg);
		if (!msg.key) return;
		upNextMaps.get(msg.key)(msg.path);
		upNextMaps.delete(msg.key);
	}
	async createRequest(ytdlData, startTime, guildID, channelID, whoPlayed) {
		try {
			let key = genID(10);
			ytdlData.user = whoPlayed;
			let data = [ytdlData, startTime];
			data[0].key = key;
			cp.send(JSON.stringify(data));
			let path = await (new Promise((res, rej) => {
				npMaps.set(key, res);
			}));
			console.log(path);
			await this.bot.createMessage(channelID, "", {file: await promises.readFile(path),name:"DazaiNowPlaying.png"});
			promises.unlink(path);
		} catch (error) {
			console.trace(error);
		}


	}
	async nextUp(currentSongLink, requestedBy, guildID, channelID, queue) {
		try {
			let key = genID(10);
			let data = [currentSongLink, requestedBy,queue,key];
			// data[0].key = key;
			upNext.send(JSON.stringify(data));
			let path = await (new Promise((res, rej) => {
				upNextMaps.set(key, res);
			}));
			let uint = (new Uint8Array(Object.values(path)));
			let buffer = new Buffer(uint.byteLength);
			for (let i = 0; i < buffer.length; ++i) {
				buffer[i] = uint[i];
			}
			// console.log(Object.keys(buffer),buffer.length+"");
			await this.bot.createMessage(channelID, "", {file: buffer,name:"DazaiNowPlaying.png"});
		} catch (error) {
			console.trace(error);
		}


	}
}
module.exports = MusicImagery;