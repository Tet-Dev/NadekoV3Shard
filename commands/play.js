const { GuildCommand } = require("eris-boiler/lib");
const ytpl = require("ytpl");
const ytsr = require("ytsr");
const ReactionHandler = require("eris-reactions");
const { ReactionCollector, MessageCollector } = require("eris-collector");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
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
function getChoice(client,msg, userid) {
	return new Promise(async (res, rej) => {
		let filter = (m, emoji, userID) => userID === userid;

		/* Create collector */
		let collector = new ReactionCollector(client, msg, filter, {
			time: 1000 * 60
		});

		/* 
		 * Emitted when collector collects something suitable for filter 
		 * For more information, please see discord.js docs: https://discord.js.org/#/docs/main/stable/class/ReactionCollector
		*/
		collector.on("collect", (m, emoji, userID) => {
			res(emoji);
		});
		setTimeout(() => {
			msg.delete();
			res(null);
		}, 60000);
	});
}
module.exports = new GuildCommand({
	name: "play", // name of command
	description: "Plays music.",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "playSong"))) {
			return "You lack the permission `playSong`";
		}
		// msg.channel.createMessage("This command has been marked as not working! Please use at your own disclousre.\nNote: ```The bot does not want to play anything ;( Working on a fix!```")
		let channelID = msg.member.voiceState.channelID;
		let search = params.join(" ");
		if (channelID) {
			let spotifyPlaylist;
			let isAlbum;

			if (search.includes("https://open.spotify.com/playlist/")) {
				spotifyPlaylist = await client.spotifyApi.getPlaylist(search.replace("https://open\.spotify\.com/playlist/", "")).catch((er) => client.createMessage(msg.channel.id, "Error while trying to process the spotify playlist!(Maybe SS to Tet?) " + er));
			}
			else if (search.includes("https://open.spotify.com/album/")) {
				isAlbum = true;
				spotifyPlaylist = await client.spotifyApi.getAlbum(search.replace("https://open\.spotify\.com/album/", "")).catch((er) => client.createMessage(msg.channel.id, "Error while trying to process the spotify playlist!(Maybe SS to Tet?) " + er));
			} else if (search.includes("https://open.spotify.com/artist/")) {
				isAlbum = true;
				spotifyPlaylist = await client.spotifyApi.getArtistTopTracks(search.replace("https://open\.spotify\.com/artist/", "").split("\?")[0], 'GB').catch((er) => client.createMessage(msg.channel.id, "Error while trying to process the spotify playlist!(Maybe SS to Tet?) " + er));
				spotifyPlaylist.body.tracks.items = spotifyPlaylist.body.tracks;
			}
			if (spotifyPlaylist) {
				let spotifyList = [];
				spotifyPlaylist.body.tracks.items.forEach((x) => {
					if (isAlbum) {
						x.artists.forEach((item, ind) => x.artists[ind] = item.name);
						spotifyList.push({
							artists: x.artists,
							name: x.name,

						});
					} else {
						x.track.artists.forEach((item, ind) => x.track.artists[ind] = item.name);
						spotifyList.push({
							artists: x.track.artists,
							name: x.track.name,

						});
					}

				});
				let spotifyWarn = await client.createMessage(msg.channel.id, "Fetching Spotify Playlist, Please do note this is slower than using a regular youtube playlist or a native inhouse playlist");

				let added = 0;
				(async () => {
					while (added < spotifyList.length) {
						await sleep(5000);
						spotifyWarn.edit("Songs Loaded: " + added + "/" + spotifyList.length + " " + Math.round(added * 1000 / spotifyList.length) / 10 + "%");
					}
				})();
				const connection = await client.joinVoiceChannel(
					msg.member.voiceState.channelID
				);
				for (let i = 0; i < spotifyList.length; i++) {
					let skip = false;

					let search = await ytsr(spotifyList[i].name + " by " + spotifyList[i].artists[0], { limit: 8 }).catch(async (er) => {
						client.createMessage(msg.channel.id, "I'm having trouble playing " + spotifyList[i].name); skip = true; console.trace(er);

					});
					if (!skip) {

						search.items = search.items.filter((x) => typeof x !== "undefined");
						search.items = search.items.filter((x) => x.type === "video");
						if (search.items.length > 0) {

							if (added == 0) {
								spotifyList.splice(i, 1);
								await client.MusicHandler.queueSong(msg, search.items[0].link, msg.channel, connection);
							} else {
								spotifyList[i].url = search.items[0].link;
							}
						}


					}
					added++;
				}

				client.MusicHandler.queueArray(msg, spotifyList.map(x => x.url).filter(x => x), connection, msg.channel, true);
			} else if (search.includes("list=")) {
				// DazaiMsg(msg.channel.id, "Sorry! Playlists are Disabled atm!")
				// return
				let resTrack= await client.MusicHandler.resolveTrack(search);
				let resthing = await client.MusicHandler.queueArray(msg,resTrack.tracks);
				if (resthing)
					msg.channel.createMessage(resthing);
			} else if (search.split("https://www\.youtube\.com/watch?").length > 1 || search.includes("https://youtu.be/")) {
				let resTrack= await client.MusicHandler.resolveTrack(search);
				// await client.MusicHandler.s(msg,resTrack.tracks);
				let resthing = await client.MusicHandler.queueSong(msg,resTrack.tracks[0]).catch(er => console.trace(er));
				if (resthing)
					msg.channel.createMessage(resthing);
				
			}else {
				let searchArr = await client.MusicHandler.getTracksFromSearch(search);//, { limit: 20 }).catch(er => console.trace(er));
				// if (!searchArr || ! searchArr.items) searchArr = await  ytsr(search, { limit: 20 }).catch(er => console.trace(er));
				// if (!searchArr || !searchArr.items) return "I could not find anything relating to your search.";
				// searchArr.items = searchArr.items.filter(x => x && x.type === "video");
				if (searchArr.tracks.length > 8) searchArr.tracks.length = 8;
				const choices = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣"];
				let fields = searchArr.tracks.map((x, ind) => {

					return {
						name: choices[ind] + " | " + x.info.title,
						value: `${SecsToFormat(Math.round(x.info.length/1000))} | [「Link」](${x.info.uri})\nBy: 《${x.info.author}》`,
						inline: false,
					};
				});

				let promptMSG = await client.createMessage(msg.channel.id, {
					embed: {


						description: "Select which one you would like to play!",
						color: 0,
						fields: fields,
					},
				});
				promptMSG.addReaction("❌");
				(async () => {
					
					for (var i = 0; i < fields.length; i++) {

						try {
							let failed = false;
							await promptMSG.addReaction(choices[i]).catch(() => {
								failed = true;
							});
							if (failed) break;
						} catch (er) {
							break;
						}
					}
				})();
				let choice = await getChoice(client,promptMSG,msg.author.id);
				if (!choice) return;
				if (choice.name === "❌") promptMSG.delete();
				for (var i = 0; i < choices.length; i++) {
					if (choice.name === choices[i]) {
						let resthing = await client.MusicHandler.queueSong(msg, searchArr.tracks[i],);
						if (resthing)
							msg.channel.createMessage(resthing);
						promptMSG.delete();
						break;
					}
				}
			}

		} else {
			return "You are not in a vc!";
		}

	}),
	options: {
		aliases: ["p"],
		parameters: ["Song Youtube Link / Spotify Playlist / Youtube Playlist / Song Name"]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});