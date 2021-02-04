
const readline = require("readline").createInterface({
	input: process.stdin,
	output: process.stdout
});
const fs = require("fs");

const fsp = fs.promises;
const Jimp = require("jimp");
const imageScript = require("imagescript");
// const request = require("request");
const fetch = require('node-fetch');
const { Image } = imageScript;

const { start } = require("repl");
const { spawn } = require("child_process");

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
let queue = [];
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
process.on("message", (data) => {
	queue.push(data);
});
let fontMap = new Map();
let bgs = new Map();

//Load Assets
(async () => {
	let allfiles = await fsp.readdir("./assets/DazaiBgs");
	fontMap.set("baloo", await fsp.readFile("./assets/baloo/Baloo-Regular.ttf"));
	for (let i = 0; i < allfiles.length; i++) {
		if (allfiles[i] === ".DS_Store" || allfiles[i].endsWith(".gif") || allfiles[i].endsWith(".mp4")) continue;
		let file = await Image.decode(fs.readFileSync(`./assets/DazaiBgs/${allfiles[i]}`)).catch(er => console.trace(er, "ER!"));
		bgs.set(`./assets/DazaiBgs/${allfiles[i]}`, file);
	}
})();
async function getBG(path) {
	return (await bgs.get(path) ? bgs.get(path).clone() : Image.decode(await fsp.readFile(path)));
}
async function generateCardData(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name) {
	let base = await getBG(bgimg);
	base = base.clone();
	base.resize(1024, 340);
	let pfp = await fetch(avatar);
	pfp = await pfp.buffer();
	pfp = await Image.decode(pfp);
	if (pfp.height <256) pfp.resize(256,256);
	pfp = pfp.cropCircle(false,0.05);
	base.composite(pfp, 40, Math.round(base.height / 2) - Math.round(pfp.height / 2));
	let rankLvl = await Image.renderText(fontMap.get("baloo"), 35, `Rank ${rank}`, Jimp.rgbaToInt(255, 255, 255, 255));
	let lvl = await Image.renderText(fontMap.get("baloo"), 80, `Level ${level}`, Jimp.rgbaToInt(255, 255, 255, 255));
	// let rect = 
	let text = await Image.renderText(fontMap.get("baloo"), 100 - (name.length ** 1.2) > 16 ? 100 - (name.length ** 1.2) : 16, name, Jimp.rgbaToInt(parseInt(colorschemeR), parseInt(colorschemeG), parseInt(colorschemeB), 255));
	// fs.writeFileSync("test2.png",await text.encode());
	let lvlDetails = await Image.renderText(fontMap.get("baloo"), 20, `${currentFormatted} / ${nextFormatted} XP`, Jimp.rgbaToInt(255, 255, 255, 255));
	base.composite(rankLvl, (pfp.width + 50), 60);
	base.composite(lvl, (pfp.width + 50), 80);
	base.composite(text, (pfp.width + 50), 150);
	xp = xp || next*0.0009765625;
	if (xp/next > 1)
		xp = next;
	let xpBar = new Image(1024*(xp/next),30);
	let color = Image.colorToRGBA(pfp.averageColor());
	color[3] = 100;
	base.drawBox(0, 320,1024, 30, Image.rgbaToColor(color[0],color[1],color[2],color[3]));
	xpBar.fill(Jimp.rgbaToInt(parseInt(colorschemeR), parseInt(colorschemeG), parseInt(colorschemeB), 255));
	base.composite(xpBar,0,318);
	base.composite(lvlDetails, 1000-(9*`${currentFormatted} / ${nextFormatted} XP`.length), 290);
	let temp = "./temp/" + genID(10) + ".png";
	base.resize(1024, 340);
	await fsp.writeFile(temp, await base.encode(3)).catch(er=>console.trace(er));
	return temp;
}
async function generateGIFCard(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name) {
	return new Promise(async (res, rej) => {
		let temp2 = "./temp/" + genID(12) + ".gif";
		let blankPath = await generateCardData(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, "./assets/jimpStuff/fullBlankBG.png", name);
		let ffmpegCMD = spawn("ffmpeg", ["-i", bgimg, "-i", blankPath, "-filter_complex", "overlay=0:0", "-pix_fmt", "yuv420p", "-c:a", "copy", temp2]);
		ffmpegCMD.on("close", () => {
			fsp.unlink(blankPath);
			res(temp2);

		});
	});

	// return temp2;
}
//Deal with the Queue
(async () => {
	while (true) {
		while (queue.length == 0) {
			await sleep(10);
		}
		try {
			let item = queue.shift();
			let args = item.split(" ");
			
			let path;
			let name = [];
			for (let i= 11; i < args.length;i++){
				if (args[i] === "png" || args[i]=== "gif") {
					args[11] = name.join(" ");
					break;
				}
				// args.splice()
				name.push(args[i]);
				args[i]=null;
			}
			args = args.filter(x=>x !== null);
			if (args[12] === "png") {
				// console.time("CreateCard");
				path = await generateCardData(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]).catch(er=>console.trace(er));
				// console.timeEnd("CreateCard");
			} else {
				path = await generateGIFCard(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
			}
			process.send({ key: args[13], path: path });
		} catch (error) {
			console.trace(error);
		}

		// abc.substring(1,abc.length-1)
		//Parse args


	}
})();
