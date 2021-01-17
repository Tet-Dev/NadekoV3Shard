const fs = require("fs");
const fsp = fs.promises;
const Jimp = require("jimp");
const ytdl = require("ytdl-core");
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
	return (parseInt(hours) ? (hours + ":") : "") + minutes + ":" + seconds;
}
let botpfp;
let obontu = fs.readFileSync("ubuntu.ttf");
let noto = fs.readFileSync("noto.otf");
// let loadtext = fs.readFileSync("noto.otf");
const imagescript = require("imagescript");
const fetch = require("node-fetch");

const { Image } = imagescript;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const axios = require("axios");
const watermark = Image.renderText(obontu, 24, "Dazai", Image.rgbToColor(255, 255, 255), 450, Image.WRAP_STYLE_WORD);
let queue = [];
process.on("message", (data) => {
	console.log("Pushed~");
	queue.push(JSON.parse(data));
});
console.time("ImageGen");
let songCache = new Map();
async function checkCacheFor(item) {
	let basicInfo = songCache.get(item);
	let attempts = 0;
	while ((!basicInfo || !basicInfo.videoDetails) && attempts < 10) {
		attempts++;
		await sleep(500);
		basicInfo = await ytdl.getInfo(item,
			{
				// requestOptions: {
				// 	headers: {
				// 		cookie: Math.random() > 0.5 ? this.YoutubeCookies : this.YoutubeCookies2,
				// 	},
				// },
			}
		).catch(er => console.trace(er));

	}
	if (!basicInfo) {
		return false;
	}
	songCache.set(item, basicInfo);
	return basicInfo;
}
async function generateCardData(dat) {
	if (!botpfp) {
		botpfp = await Image.decode(await (await fetch("https://cdn.discordapp.com/avatars/747901310749245561/304d84076c1f943a166bf32e1406b28a.png?size=64")).buffer());
		// botpfp.opacity(0.5,true);
	}
	let loadtext = obontu;
	// console.error(dat);
	let data = await checkCacheFor(dat[0]);
	let nextSongs = dat[2] || [];
	// let timeStart = dat[1];
	let pr = data.player_response || data;
	// eslint-disable-next-line no-control-regex
	// if (pr.videoDetails.title.match(/[^\x00-\x7F]/g)) {
	// 	loadtext = noto;
	// }
	console.timeLog("ImageGen");
	let thumbnail;
	let link = `https://i.ytimg.com/vi/${pr.videoDetails.videoId}/maxresdefault.jpg`;
	let thumbnail2 = await fetch(link);
	thumbnail2 = await Image.decode(await thumbnail2.buffer());
	console.timeLog("ImageGen");
	if (thumbnail2.width == 120 && thumbnail2.height == 90) {
		link = `https://i.ytimg.com/vi/${pr.videoDetails.videoId}/hqdefault.jpg`;
		thumbnail = await fetch(link);
		thumbnail = await thumbnail.buffer();
		thumbnail = await Image.decode(thumbnail);


	} else {
		thumbnail = thumbnail2;
	}
	console.timeLog("ImageGen");
	let bgcopy = await thumbnail.clone();
	bgcopy = await Jimp.read(link);
	bgcopy.blur(20);
	bgcopy = await Image.decode(await bgcopy.getBufferAsync(Jimp.MIME_PNG));
	bgcopy.opacity(0.5, true);
	console.timeLog("ImageGen");
	bgcopy.resize(1024, bgcopy.height * (1024 / bgcopy.width));

	thumbnail.crop(Math.round((thumbnail.width / 2) - ((thumbnail.height - 90) / 2)), 45, thumbnail.height - 90, thumbnail.height - 90);
	thumbnail.roundCorners(25);
	console.timeLog("ImageGen");
	// thumbnail.roundCorners(5)
	let newimage = new Image(1024, 420);
	let avgColor = thumbnail.averageColor();
	// const bgGradient = Image.gradient({0: thumbnail.averageColor(), 1: thumbnail.dominantColor()});
	console.timeLog("ImageGen");
	//
	// data.videoDetails.title+= "jqrkjwqhrlkqwnjkfnqwlf";
	// newimage.fill((x, y) => bgGradient((x + y) / (1024+340)));
	let titleSize = Math.round(50 * (0.985) ** data.videoDetails.title.length);
	let rgbavg = Image.colorToRGBA(avgColor);
	console.log(pr.videoDetails.title.length);
	// if (pr.videoDetails.title.length > 33){ 
	// 	pr.videoDetails.title= pr.videoDetails.title.substring(0,30);
	// 	pr.videoDetails.title += "...";
	// 	console.log(pr.videoDetails.title,pr.videoDetails.title.length);
	// }
	console.timeLog("ImageGen");
	let color = Image.colorToRGBA(thumbnail.dominantColor());

	console.log(data.videoDetails.author.name);
	let thumbnaile = data.videoDetails.author.thumbnails.shift();
	let authorpfp = await Image.decode(await (await fetch(thumbnaile ? thumbnaile.url : "https://cdn.discordapp.com/avatars/747901310749245561/304d84076c1f943a166bf32e1406b28a.png?size=128")).buffer());
	authorpfp.roundCorners(10);
	authorpfp.resize(64, 64);
	let authorSize = Math.round(45 * (0.95) ** data.videoDetails.author.name.length);
	let author = await Image.renderText(loadtext, authorSize, data.videoDetails.author.name, Image.rgbToColor(255, 255, 255), 131, Image.WRAP_STYLE_WORD);
	// let upNext = await Image.renderText(loadtext, 45, "Up Next",Image.rgbaToColor(color[0],color[1],color[2],200), 600, Image.WRAP_STYLE_WORD);
	console.timeLog("ImageGen");
	let imgText = await Image.renderText(loadtext, 40, data.videoDetails.title.substring(0, 38), Image.rgbToColor(255, 255, 255), 12000, Image.WRAP_STYLE_WORD);
	imgText.crop(0, 0, imgText.width > 645 ? 645 : imgText.width, imgText.height);
	console.timeLog("ImageGen");
	let vidlen = SecsToFormat((pr.videoDetails.lengthSeconds || 0));
	let duraText = await Image.renderText(loadtext, 32, `Length: ${vidlen}`, Image.rgbToColor(255, 255, 255), 450, Image.WRAP_STYLE_WORD);
	let requestedBy = await Image.renderText(loadtext, 24, `${dat[1]}`, bgcopy.dominantColor(true, true,), 600, Image.WRAP_STYLE_WORD);
	let nextQueue = new Image(645, 127);
	nextQueue.fill(Image.rgbaToColor(0, 0, 0, 150));
	console.time("QueueGen");
	for (let i = 0; i < nextSongs.length; i++) {
		if (i == 2) {
			checkCacheFor(nextSongs[i]);
			break;
		};
		console.time("QueueItemGen");
		let tempImg = new Image(645, 57);
		let binfo = await checkCacheFor(nextSongs[i]);
		console.timeLog("QueueItemGen");
		let ithumb = await fetch(`https://i.ytimg.com/vi/${binfo.videoDetails.videoId}/hqdefault.jpg`);
		ithumb = await Image.decode(await ithumb.buffer());
		console.timeLog("QueueItemGen");
		ithumb.crop(Math.round((ithumb.width / 2) - ((ithumb.height - 90) / 2)), 45, ithumb.height - 90, ithumb.height - 90);
		console.timeLog("QueueItemGen");
		ithumb.resize(57, 57);
		binfo.videoDetails.title += "                                       ";
		let tText = await Image.renderText(loadtext, 32, `#${i + 1}| ${SecsToFormat(binfo.videoDetails.lengthSeconds)} | ${binfo.videoDetails.title.substring(0, 30)}`, Image.rgbToColor(255, 255, 255));
		tText.crop(0,0,550,tText.height);
		console.timeLog("QueueItemGen");
		tempImg.composite(tText, 5, 12.5);
		tempImg.composite(ithumb, 580, 0);
		console.timeLog("QueueItemGen");
		nextQueue.roundCorners(8);
		console.timeEnd("QueueItemGen");
		nextQueue.composite(tempImg, 0, (i + 1) * 5 + i * 57);
		console.timeLog("QueueGen");
	}
	console.timeEnd("QueueGen");
	// newimage.lightness(0.5,true);
	console.timeLog("ImageGen");
	thumbnail.resize(240, 240);
	newimage.composite(bgcopy, 0, 0);
	newimage.composite(thumbnail, 51, 51);
	newimage.composite(requestedBy, 326, 135 - 52);
	// newimage.composite(upNext, 113, 35);
	newimage.composite(imgText, 325, 90 - 72 + (imgText.height) / 2);
	newimage.composite(duraText, 326, 165 - 52);
	newimage.composite(authorpfp, 51, 311 + 14);
	newimage.composite(author, 51 + 69, 311 + 14 + (((authorpfp.height) - author.height)) / 2);
	newimage.roundCorners(25);
	newimage.composite(nextQueue, 327, 216 - 52);
	console.timeLog("ImageGen");
	// let box = new Image((((Math.ceil((new Date()).getTime() / 1000) - timeStart) / pr.videoDetails.lengthSeconds) * 1024), 20);
	// box.fill(Image.rgbaToColor(0,0,0,100));
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
	// newimage.composite(box, 0, 400);
	// newimage.opacity(0.4,true);
	// console.timeLog("ImageGen");
	// let path = `./temp/${genID(10)}.png`;
	// await fsp.writeFile(path, );
	// console.timeLog("ImageGen");
	// console.timeEnd("ImageGen")
	let encodeData = (await newimage.encode(3));
	return encodeData;
}
//GetYTDL
// (async () => {
// 	queue.push(["https://www.youtube.com/watch?v=_W88oVKhNW0&ab_channel=Geoxor","Degenetet#0001",["https://www.youtube.com/watch?v=5eu_fkIbmxc&ab_channel=Geoxor-Topic","https://www.youtube.com/watch?v=LLrcN9oK-g0&ab_channel=Geoxor-Topic","https://www.youtube.com/watch?v=AnMhdn0wJ4I&ab_channel=WaveMusic"]]);
// 	console.log("pushed");
// })();
(async () => {
	while (true) {
		while (queue.length == 0) {
			await sleep(10);
		}

		let item = queue.shift();
		let path = await generateCardData(item).catch(er => console.log(er));
		// console.log({ key: item[3]});
		process.send({ key: item[3], path: path });

		// abc.substring(1,abc.length-1)
		//Parse args


	}
})();
