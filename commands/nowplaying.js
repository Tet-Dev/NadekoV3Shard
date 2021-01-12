const { GuildCommand } = require("eris-boiler/lib");
const imagescript = require("imagescript");
const fetch = require('node-fetch');
const fs = require("fs");
const axios = require("axios");
const fsp = fs.promises;
const {Image} = imagescript;

function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
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
// let loadtext = fs.readFileSync("ubuntu.ttf");
let loadtext = fs.readFileSync("noto.otf");
module.exports = new GuildCommand({
	name: "nowplaying", // name of command
	description: "Displays whats playing right now!",
	run: (async (client, { msg, params }) => {
		let dat = await client.MusicHandler.getCurrentSong(msg.guildID);

		console.log({
			auth: client.token,
			startTime: dat[1],
			song: dat[0],
			guild: msg.guildID,
			channel: msg.channel.id,
		});
		if (!dat) return "Nothing is Playing!";
		let dat2 = await axios.post("https://api.dazai.app/api/generateMusicCard",{
			auth: client.token,
			startTime: dat[1],
			song: dat[0],
			guild: msg.guildID,
			channel: msg.channel.id,
		}).catch(er=>{});
    // console.log(dat2.data,dat2.status)
		// let path = await client.MusicHandler.sendMessage(dat);
		// await client.createMessage(msg.channel.id, {
		// },{file: await fsp.readFile(path),name: "DazaiNP.png"});
		// fsp.unlink(path);
	}),
	options: {
		aliases: ["np"]
	}
});