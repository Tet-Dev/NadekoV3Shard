const fs = require("fs");
const Jimp = require("jimp");
const { spawn } = require("child_process");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
async function createCard(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name) {
	var bgmask = await Jimp.read("assets/jimpStuff/reverseMask.png");
	var baseimg = bgimg;
	bgmask.resize(1024, 340);
	var textlayerUncol = (await Jimp.read("assets/jimpStuff/blank.png"));
	textlayerUncol.resize(1024, 340);
	textlayerUncol.mask(bgmask, 0, 0);

	var textlayerCol = (await Jimp.read("assets/jimpStuff/blank.png"));
	textlayerCol.resize(1024, 340);
	textlayerCol.mask(bgmask, 0, 0);
	if (name.length > 20) {
		// Jimp.loadFont()
		textlayerCol.print(await Jimp.loadFont("./assets/baloo/Baloo32B.fnt"), (avatar.bitmap.width + 50), 125 * 1.2, name);
	}
	else if (name.length >= 10) {
		textlayerCol.print(await Jimp.loadFont("./assets/baloo/Baloo64B.fnt"), (avatar.bitmap.width + 50), 125 * 1.2, name);
	} else {
		textlayerCol.print(await Jimp.loadFont("./assets/baloo/Baloo100B.fnt"), (avatar.bitmap.width + 50), 100, name);
	}
	textlayerUncol.print(await Jimp.loadFont("./assets/baloo/Baloo128.fnt"), (avatar.bitmap.width + 50) * 1.2, 75 * 1.2, "Level " + level);

	textlayerUncol.print(await Jimp.loadFont("./assets/baloo/Baloo64.fnt"), (avatar.bitmap.width + 52) * 1.2, 40, "Rank #" + rank);

	// var raterstrize1 = "temp/" + genID(15) + ".png";
	// var raterstrize2 = "temp/" + genID(15) + ".png";
	// await textlayerCol.writeAsync(raterstrize2);
	// // await textlayerUncol.writeAsync(raterstrize2)
	// textlayerCol = await Jimp.read(raterstrize2);
	// textlayerCol.scale(1)
	textlayerUncol.scale(0.6);
	textlayerCol.color([
		{ apply: "darken", params: [100] },
		{ apply: "red", params: [colorschemeR] },
		{ apply: "blue", params: [colorschemeB] },
		{ apply: "green", params: [colorschemeG] },
		// { apply: 'xor', params: ['#06D'] }
	]);
	var xpbar = (await Jimp.read("assets/jimpStuff/blank.png"));
	if (xp == 0) {
		xp = 1;
	}
	xpbar.resize(Math.ceil(1024 * (xp / next)), 20);
	xpbar.color([
		{ apply: "darken", params: [100] },
		{ apply: "red", params: [colorschemeR] },
		{ apply: "blue", params: [colorschemeB] },
		{ apply: "green", params: [colorschemeG] },
		// { apply: 'xor', params: ['#06D'] }
	]);
	var xpLayer = (await Jimp.read("assets/jimpStuff/blank.png"));
	xpLayer.resize(1024, 340);
	xpLayer.mask(bgmask, 0, 0);
	xpLayer.print(await Jimp.loadFont("./assets/baloo/Baloo64.fnt"), 425, 150, currentFormatted + "/" + nextFormatted + " XP");
	xpLayer.scale(0.4);
	// textlayerUncol = await Jimp.read(raterstrize2)
	// await fs.unlinkSync(raterstrize1)
	// await fs.unlinkSync(raterstrize2)
	// avatar.composite(await Jimp.read("assets/jimpStuff/mask.png"),0,0)
	avatar.mask(await Jimp.read("assets/jimpStuff/mask.png"), 0, 0);
	avatar.autocrop(0.1, false);
	// baseimg.resize()
	baseimg.composite(avatar, 40, Math.round(baseimg.bitmap.height / 2) - Math.round(avatar.bitmap.height / 2));
	baseimg.composite(textlayerUncol, 88, 50);
	baseimg.composite(textlayerCol, 0, 50);
	baseimg.composite(xpbar, 0, 320);
	baseimg.composite(xpLayer, 625, 230);
	// fs.unlink(raterstrize2, () => { });
	return baseimg;
}
async function composite(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name) {
	let PromiseArray = [Jimp.read(bgimg), Jimp.loadFont("./assets/baloo/Baloo64.fnt"), Jimp.read("assets/jimpStuff/rankthing.png"), Jimp.read(avatar)];
	// await Promise.all(PromiseArray);

	var baseimg = await PromiseArray[0];
	baseimg.resize(1024, 340);
	avatar = await PromiseArray[3];
	avatar.resize(256, 256);
	var raterstrize1 = "./temp/" + genID(10) + ".png";
	console.time("CreateCard");
	baseimg = await createCard(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, baseimg, name);
	console.timeEnd("CreateCard");
	await baseimg.writeAsync(raterstrize1);

	return {
		// rs: await fs.createReadStream(raterstrize1),
		path: raterstrize1
	};
}
async function gifComposite(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bggif, name) {
	const { GifUtil, GifFrame, BitmapImage } = require("gifwrap");
	avatar = await Jimp.read(avatar);
	var avatarbMao = new BitmapImage(avatar.bitmap);

	var agifframe = new GifFrame(avatarbMao);
	avatar = await GifUtil.copyAsJimp(Jimp, agifframe);
	var bgimg = await GifUtil.read(bggif);
	var base = await Jimp.read("./assets/jimpStuff/fullBlankBG.png");
	var overLay = await createCard(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, base, name);



	var proArr = [];
	var prefix = "./temp/" + genID(15) + "-";
	var total = 0;
	for (var i = 0; i < bgimg.frames.length; i++) {
		// eslint-disable-next-line no-inner-declarations
		async function breh(selfi) {
			return new Promise(async function (resolve){
				var yas = await GifUtil.copyAsJimp(Jimp, bgimg.frames[selfi]);

				yas.composite(overLay, 0, 0);
				yas.quality(70);
				await yas.writeAsync(prefix + selfi + ".jpg");
				total++;
				resolve();
			});
			
		}
		proArr.push(breh(i));
	}
	await Promise.all(proArr);



	var mp4file = "./temp/" + genID(10) + ".mp4";
	var giffile = "./temp/" + genID(10) + ".gif";
	var fmepgS = await spawn("ffmpeg", ["-r 30", "-f image2", "-s 1024x340", "-i " + prefix + "%d.jpg", "-vcodec libx265", "-crf 25", "-pix_fmt yuv420p", mp4file], {
		shell: true,
		windowsHide: true,

	});
	//ffmpeg -i RankCard.mp4 -r 45 -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" return.gif
	//scale=768:255
	var done = false;

	fmepgS.on("close", async () => {
		await sleep(300);
		var converttoGif = await spawn("ffmpeg", ["-i " + mp4file, "-r 30", "-vf \"split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse\"", giffile], {
			shell: true,
			windowsHide: true,

		});
		converttoGif.on("close", async () => {
			done = true;
		});
	});
	while (!done) {
		await sleep(300);
	}
	for (var iterate = 0; iterate < bgimg.frames.length; iterate++) {
		fs.unlink(prefix + iterate + ".png", () => { });
	}
	fs.unlink(mp4file, () => { });
	return ({
		// rs: await fs.createReadStream(giffile),
		path: giffile
	});
}
let level = process.argv[2];
let xp = process.argv[3];
let nextLevel = process.argv[4];
let levelFormatted = process.argv[5];
let NextlevelFormatted = process.argv[6];
let r = process.argv[7];
let g = process.argv[8];
let b = process.argv[9];
let rank = process.argv[10];
let url = process.argv[11];
let link = process.argv[12]; 
let nick = process.argv[13];
let imgType = process.argv[14];
process.on("stdin",(data)=>{
	console
})
if (process.argv.length == 15){
	(imgType === "png"? composite(level,xp,nextLevel,levelFormatted,NextlevelFormatted,r,g,b,rank,url,link,nick):gifComposite(level,xp,nextLevel,levelFormatted,NextlevelFormatted,r,g,b,rank,url,link,nick)).then(x=>{
		console.log(x.path);
	}).catch(er=>console.log(er));
	
}else{
	console.log(process.argv);
}
