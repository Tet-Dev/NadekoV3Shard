let queue = [];
const fs = require("fs");

const fsp = fs.promises;
// const Jimp = require("jimp");
const imageScript = require("imagescript");
const { Image } = imageScript;
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
// eslint-disable-next-line no-undef
// process.on("message", (data) => {
// 	queue.push(data);
// });
let g = {
	link: "./assets/tiles/grass.png"
};
let matrixx = [];
let glist = [g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g, g];
for (let i = 0; i < 54; i++) {
	matrixx.push(glist);
}
setTimeout(() => {
	queue.push(
		{
			board: matrixx,
			coins: "6.9K",
			location: "DazaiLand"
		}
	);
}, 8000);

let assetMap = new Map();
//Init the assets
(async () => {
	assetMap.set("emptyBoard", new Image(1024, 720));
	assetMap.set("ubuntu", await fsp.readFile("./assets/ubuntu.ttf"));
	assetMap.set("boardGUI", await Image.decode(await fsp.readFile("./assets/dazaiBoardBG.png")));
	let files = await fsp.readdir("./assets/tiles/");
	for (let i = 0; i < files.length; i++) {
		if (files[i].includes(".DS") || files[i].includes(".gif")) continue;
		assetMap.set(files[i], await Image.decode(await fsp.readFile(`./assets/tiles/${files[i]}`)));
	}
})();
async function getImage(path) {
	let img = assetMap.get(path.split("/").pop());
	if (!img) {
		img = await Image.decode(await fsp.readFile(path));
		assetMap.set(path.split("/").pop(), img);
	}
	img = img.clone();
	return img;
}
async function drawBoard(boardMatrix) {

	let matrixImgs = await Promise.all(boardMatrix.board.map(async x => await Promise.all(await x.map(async y => getImage(y.link)))));
	let baseBoardImg = await getImage("emptyBoard");
	let baseimg = await getImage("./assets/dazaiBoardBG.png");
	let font = await fsp.readFile("./assets/ubuntu.ttf");//assetMap.get("ubuntu");
	let coins = await Image.renderText(font, 8, `${boardMatrix.coins} DC`, 0);
	let location = await Image.renderText(font, 8, `${boardMatrix.location}`, 0);

	// console.log(matrixImgs)
	console.time("draw");
	baseimg.composite(location, 69, 832);
	baseimg.composite(coins, 69, 924);
	for (let y = 0; y < matrixImgs.length; y++) {
		// let ymatrix = matrixImgs[y];
		// console.log(matrixImgs[y].length+"");
		for (let x = 0; x < matrixImgs[y].length; x++) {
			// console.log("drawing1",x,y);
			baseBoardImg.composite(matrixImgs[y][x], x * 16, y * 16);
		}
		// console.timeLog("draw");
		// console.log("drawing",ymatrix);
	}

	baseimg.composite(baseBoardImg, 384, 25);
	// console.timeLog
	// baseimg.resize(360,256);
	console.timeLog("draw");
	let temp = `./temp/${genID(20)}.png`;
	
	let compression = await baseimg.encode(3);
	console.timeLog("draw");
	await fsp.writeFile(temp,compression );
	console.timeEnd("draw");
	return temp;

	//384 25

}
(async () => {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		while (queue.length == 0) {
			await sleep(10);
		}
		let item = queue.shift();
		console.log(await drawBoard(item).catch(er => console.trace(er)));
	}
})();