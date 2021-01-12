const fs = require("fs");
const fsp = fs.promises;
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
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
	return (parseInt(hours) > 0 ? (hours + ":") : "") + minutes + ":" + seconds;
}
let obontu = fs.readFileSync("ubuntu.ttf");
let noto = fs.readFileSync("noto.otf");
const imagescript = require("imagescript");
const fetch = require("node-fetch");

const { Image } = imagescript;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const axios = require("axios");
let queue = [];
process.on("message", (data) => {
	queue.push(JSON.parse(data));
});
async function generateCardData(dat) {
	let loadtext = obontu;
	// console.error(dat);
	let data = await dat[0];
	let timeStart = dat[1];
	let pr = data.player_response || data;
	// eslint-disable-next-line no-control-regex
	if (pr.videoDetails.title.match(/[^\x00-\x7F]/g)) {
		loadtext = noto;
	}
	let diffTime = SecsToFormat((Math.ceil((new Date()).getTime() / 1000) - timeStart) + "");
	// let url = pr.videoDetails.thumbnail.thumbnails.pop().url.split("?")[0];
	// console.log(url)

	let thumbnail = await fetch(`https://i.ytimg.com/vi/${pr.videoDetails.videoId}/hqdefault.jpg`);
	thumbnail = await thumbnail.buffer();
	try {
		thumbnail = await Image.decode(thumbnail);
	} catch (er) {
		console.log(er);
		thumbnail = await fetch(`https://i.ytimg.com/vi/${pr.videoDetails.videoId}/maxresdefault.jpg`);
		thumbnail = await thumbnail.buffer();
		thumbnail = await Image.decode(thumbnail);
	}
	// thumbnail.crop
	thumbnail.crop(Math.round((thumbnail.width / 2) - ((thumbnail.height - 90) / 2)), 45, thumbnail.height - 90, thumbnail.height - 90);
	// thumbnail.roundCorners(5)
	let newimage = new Image(1024, 420);
	let avgColor = thumbnail.averageColor();
	newimage.fill(avgColor);
	newimage.roundCorners(5);
  let rgbavg = Image.colorToRGBA(avgColor);
  let textsize = 50;
  
	if (pr.videoDetails.title.length > 20){ 
		pr.videoDetails.title.length = 17;
    pr.videoDetails.title += "...";
   
  }
  // textsize = Math.ceil(75-((pr.videoDetails.title+"").length**1.1));
	let imgText = await Image.renderText(loadtext, textsize, pr.videoDetails.title, Image.rgbToColor(255, 255, 255), 600, Image.WRAP_STYLE_WORD);
	let vidlen = SecsToFormat((pr.videoDetails.lengthSeconds || 0));
	let duraText = await Image.renderText(loadtext, 32, `${diffTime} / ${vidlen}`, Image.rgbToColor(255, 255, 255), 450, Image.WRAP_STYLE_WORD);
	// newimage.lightness(0.5,true);
	thumbnail.resize(300, 300);
	newimage.composite(thumbnail, 60, 60);
	newimage.composite(imgText, 400, 60 - 11);
	newimage.composite(duraText, 650, 340);
	let box = new Image((((Math.ceil(Date.now() / 1000) - timeStart) / pr.videoDetails.lengthSeconds) * 1024), 20);
	box.fill(Image.rgbaToColor(0, 0, 0, 100));
	// box.opacity(0.5)
	// let res = await axios.post("http://colormind.io/api/",
	//   {
	//     input: rgbavg.splice(0, 3).concat("N", "N", "N"),
	//     model: "default"
	//   },
	//   {
	//     "Content-Type": "application/json",
	//     "Accept" : "*/*",

	//   }

	// ).catch(er => {});
	// if (res && res.data) {
	//   console.log(res.data)

	// }
	newimage.composite(box, 0, 400);
	// newimage.opacity(0.4,true);
	let path = `./temp/${genID(10)}.png`;
	await fsp.writeFile(path, await newimage.encode(3));
	return path;

}
(async () => {
	while (true) {
		while (queue.length == 0) {
			await sleep(10);
		}

		let item = queue.shift();
		let path = await generateCardData(item).catch(er => process.send(er + ""));
		process.send({ key: item[0].key, path: path });
		// abc.substring(1,abc.length-1)
		//Parse args


	}
})();
