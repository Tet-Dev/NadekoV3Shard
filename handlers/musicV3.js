// const ytdl = require("ytdl-core");
const axios = require("axios");

const { PlayerManager } = require("eris-lavalink");
// const { null } = require("mathjs");
const ms = require("ms");
const superagent = require('superagent');
class TetMap {
	constructor() {
		this.map = new Map();
	}
	get() {

	}
}
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
function getStreamInfo(stream) {
	return new Promise((res, rej) => {
		stream.on("info", (info) => res(info));
	});
}

function shuffle(array) {
	let counter = array.length;

	// While there are elements in the array
	while (counter > 0) {
		// Pick a random index
		let index = Math.floor(Math.random() * counter);

		// Decrease counter by 1
		counter--;

		// And swap the last element with it
		let temp = array[counter];
		array[counter] = array[index];
		array[index] = temp;
	}

	return array;
}
function parseBasicInfo(info) {
	return {
		title: info.videoDetails.title,
		artist: info.videoDetails.author.name,
		lengthSeconds: info.videoDetails.lengthSeconds,
		thumbnail: info.videoDetails.thumbnails.filter(x => !x.url.includes(".webp")).sort((a, b) => b.width * b.height - a.width * a.height).shift().url,
		artistPfp: info.videoDetails.author.thumbnails.filter(x => !x.url.includes(".webp")).sort((a, b) => b.width * b.height - a.width * a.height).shift().url,
	};
}
function getPlayer(channel) {
	if (!channel || !channel.guild) {
		return Promise.reject("Not a guild channel.");
	}

	let player = client.voiceConnections.get(channel.guild.id);
	if (player) {
		return Promise.resolve(player);
	}

	let options = {};
	if (channel.guild.region) {
		options.region = channel.guild.region;
	}

	return client.joinVoiceChannel(channel.id, options);
}
async function resolveTracks(node, search) {
	// try {
	const result = await superagent.get(`https://${node.host}:443/loadtracks?identifier=${search}`)
		.set("Authorization", node.password)
		.set("Accept", "application/json");
	// } catch (err) {
	// 	throw err;
	// }

	if (!result) {
		throw "Unable play that video.";
	}

	return result.body; // array of tracks resolved from lavalink
}
let client;
let nodes;
let regions;
let guildData = new Map();
let musicCache = new Map();
class MusicHandler {
	constructor(bot) {
		this.bot = bot;
		client = bot;
		this.handler = new Map();
		this.songCache = new Map();
		this.YoutubeCookies = process.env.YoutubeCookies;
		this.YoutubeCookies2 = process.env.YoutubeCookies2;
		console.log(this.YoutubeCookies);
		nodes = [
			// { host: "Lavalink-Node-1.icedplasma.repl.co", port: 80, region: "us", password: "dazaiAppTet$" },
			{ host: "Lavalink-Node-2.icedplasma.repl.co", port: 80, region: "us", password: "dazaiAppTet$" },
			{ host: "Lavalink-Node-3.icedplasma.repl.co", port: 80, region: "us", password: "dazaiAppTet$" }
			
		];

		regions = {
			// eu: ["eu", "amsterdam", "frankfurt", "russia", "hongkong", "singapore", "sydney"],
			us: ["us"],
		};

		if (!(client.voiceConnections instanceof PlayerManager)) {
			client.voiceConnections = new PlayerManager(client, nodes, {
				numShards: client.shards.size, // number of shards
				userId: client.user.id, // the user id of the bot
				regions: regions,
				defaultRegion: "us",
			});
		}
	}
	async getTracksFromSearch(term) {
		let data = await resolveTracks(nodes[0], `ytsearch:${term}`).catch(er => console.error(er));
		return data;
		console.log(data.tracks[0]);
	}
	async resolveTrack(term){
		let data = await resolveTracks(nodes[0], `${term}`).catch(er => console.error(er));
		return data;
		console.log(data);
	}
	//plr.state.position is the position of the time
	async testfunc() {
		try {
			let tracks = await resolveTracks(nodes[0], "https://www.youtube.com/watch?v=CtKsPCebhPs&ab_channel=FollowUrHeart");
			tracks = tracks.tracks;
			let plr = await getPlayer(client.guilds.get("739559911033405592").channels.get("739559915110006859"));
			plr.play(tracks[0].track);
			console.log(tracks[0]);
			await sleep(10000);
			console.log(plr.state);
		} catch (error) {
			console.trace(error);
		}

	}
	async test() {
		console.log("testing");
		let data = await resolveTracks(nodes[0], "spotify:https://open.spotify.com/playlist/19KM4tXWSTCAtxOWFT7E0u?si=GhAlPJvFQp2nmbgT5ATUSg").catch(er => console.error(er));
		console.log(data);
		console.log("testingE");
	}
	async queueArray(msg, tracks) {
		if (tracks.length == 0)
			return "Empty playlist!";
		await this.queueSong(msg, tracks.shift());
		let data = guildData.get(msg.guildID);
		data.queue = data.queue.concat(tracks.map(x=>{
			return {
				track: x,
				msg: msg,
			};
		}));
		guildData.set(msg.guildID, data);
		return `Queued ${tracks.length + 1} tracks!`;
	}
	async getQueue(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj || gobj.queue.length == 0)
			return [];
		return gobj.queue.map((x,ind)=>{
			return {
				name: ` ${ind+1} | ${x.track.info.title}`,
				value: `${SecsToFormat(Math.round(x.track.info.length/1000))} | Requested by: ${x.msg.member.nick || x.msg.author.username}#${x.msg.author.discriminator} [[Link]](${x.track.info.uri})`,
				inline:false
			};
		});
	}
	async addUserSkip(guildID, userID) {
		let failed = false;
		let data = guildData.get(guildID);
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
	async skipSong(guildID){
		let gobj = guildData.get(guildID);
		if (!gobj){
			return null;
		}
		gobj.connection.stop();
	}
	toggleLoop(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj){
			return null;
		}
		gobj.loop = !gobj.loop;
		guildData.set(guildid,gobj);
		return gobj.loop;
	}
	async stop(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj){
			return null;
		}
		gobj.connection.stop();
		client.leaveVoiceChannel(gobj.connection.channelId);
		guildData.delete(guildid);
		return true;
	}
	async pause(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj){
			return 0;
		}
		if (gobj.connection.paused){
			return 1;
		}
		gobj.connection.setPause(true);
		return 2;
	}
	async resume(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj){
			return 0;
		}
		if (!gobj.connection.paused){
			return 1;
		}
		gobj.connection.setPause(false); 
		return 2;
	}
	async getCurrentSong(guildid){
		let gobj = guildData.get(guildid);
		if (!gobj || !gobj.nowPlaying){
			return null;
		}
		// let retobj = 
		return {
			info: musicCache.get(gobj.nowPlaying.track.track),
			requestedBy: gobj.nowPlaying.msg.member,
			timeStarted: gobj.nowPlaying.startedAt,
		};
	}
	async queueSong(msg, track, member) {
		if (!msg.guildID) {
			return;
		}
		let gobj = guildData.get(msg.guildID);
		musicCache.set(track.track, track);
		if (!gobj) {
			let channelID = msg.member.voiceState.channelID;
			let channel = client.guilds.get(msg.guildID).channels.get(channelID);
			if (!channel) {
				channel = await client.getRESTChannel(channelID);
			}
			if (!channel.permissionsOf(client.user.id).has("voiceConnect"))
				return "No permission to join the VC!";
			gobj = {
				guild: msg.guildID,
				connection: await getPlayer(channel),
				queue: [],
				skips: [],
				loop:false,
				
			};
			guildData.set(msg.guildID, gobj);
		}
		if (gobj.nowPlaying) {
			gobj.queue.push({
				track: track,
				// requestedBy: msg.member,
				msg: msg,
			});
			guildData.set(msg.guildID, gobj);
			return `Added ${track.info.title} to the Queue`;
		} else {
			gobj.connection.play(track.track);
			axios.post("https://api.dazai.app/api/generateStartPlayMusicCard", {
				auth: this.bot.token,
				queue: await Promise.all(gobj.queue.map(async x => musicCache.get(x.track))
				),
				song: track,
				guild: msg.guildID,
				channel: msg.channel.id,
				whom: `${(msg.member.nick || msg.author.username)}#${msg.author.discriminator}`,
			}).catch(er => { });
			gobj.nowPlaying = {
				track: track,
				startedAt: Date.now(),
				msg: msg,
			};
			guildData.set(msg.guildID, gobj);
			gobj.connection.once("end", async (reason) => {
				if (reason.reason === "REPLACED")
					return console.log("Ignoring",reason);
				console.log("End Reason:",reason);
				let ndata = guildData.get(msg.guildID);
				if (ndata.loop){
					delete ndata.nowPlaying.startedAt;
					ndata.queue.push(ndata.nowPlaying);
				}
				ndata.skips = [];
				ndata.nowPlaying = null;
				guildData.set(msg.guildID, ndata);
				// console.log({
				// 	queue:ndata.queue});
				if (ndata.queue.length > 0) {
					let song = ndata.queue.shift();
					guildData.set(msg.guildID, ndata);
					// while (!gobj.connection.ready){
					// 	await sleep(10);
					// }
					// await sleep(500);
					await this.queueSong(song.msg, song.track).catch(er=>console.trace(er));
					// console.log("queued song!");

				} else {
					// msg.channel.createMessage("Queue Finished!");
					ndata.connection.leave(msg.guildID);
				}
			});

			// gobj.connection
		}



	}

}
module.exports = MusicHandler;