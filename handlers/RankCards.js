let bot;
const { streamWrite, streamEnd, onExit } = require("@rauschma/stringio");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const { spawn, fork } = require("child_process");
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
let rankCardGenerator;//spawn("node", ["./RankCardHandler.js"]);
// let rankCardGenerator2 = spawn("node", ["./RankCardHandler.js"]);
// let rankCardGenerator3 = spawn("node", ["./RankCardHandler.js"]);
class RankCardHandler {
	constructor(b) {
		bot = b;
		this.queue = [];
		// this.process();
		this.waits = new Map();
		this.current = 0;
		// this.getWaits();
		rankCardGenerator = fork("./RankCardHandler.js", {
			// silent: true
		});
		rankCardGenerator.on("message", async (data) => {
			// console.log("Clong" + data);
			// let dts = data.toString();
			// this
			// let splits = dts.split(" ");
			if (this.waits.has(data.key)) {
				this.waits.get(data.key).cb(data.path);

			}
			// await streamWrite(this.instance.stdin, prompt);
		});
	}
	// async process() {
	// 	let current = 0;
	// 	while (true) {
	// 		while (this.queue.length == 0) {
	// 			await sleep(10);
	// 		}

	// 		let item = this.queue.shift();
	// 		let args = item;
	// 		// console.log(Object.assign({}, args));
	// 		let path;
	// 		if (args[12] === "png") {
	// 			console.time("CreateCard");
	// 			path = await generateCardData(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
	// 			console.timeEnd("CreateCard");
	// 		} else {
	// 			path = await generateGIFCard(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11]);
	// 		}
	// 		console.log(args[12], path);
	// 		// abc.substring(1,abc.length-1)
	// 		//Parse args


	// 	}
	// }
	// getWaits() {
		
	// 	// rankCardGenerator.stderr.on("data", async (data) => {
	// 	// 	console.log("err",data);
	// 	// 	// await streamWrite(this.instance.stdin, prompt);
	// 	// });
	// 	// rankCardGenerator2.stdout.on("data", async (data) => {
	// 	// 	let dts = data.toString();
	// 	// 	// this
	// 	// 	let splits = dts.split(" ");
	// 	// 	if (this.waits.has(splits[0])) {
	// 	// 		this.waits.get(splits[0]).cb();

	// 	// 	}
	// 	// 	// await streamWrite(this.instance.stdin, prompt);
	// 	// });
	// 	// rankCardGenerator3.stdout.on("data", async (data) => {
	// 	// 	let dts = data.toString();
	// 	// 	// this
	// 	// 	let splits = dts.split(" ");
	// 	// 	if (this.waits.has(splits[0])) {
	// 	// 		this.waits.get(splits[0]).cb(splits[1]);

	// 	// 	}
	// 	// 	// await streamWrite(this.instance.stdin, prompt);
	// 	// });

	// }
	// getCurrent() {
	// 	let item;
	// 	switch (this.current) {
	// 		case 0:
	// 			item = rankCardGenerator;
	// 			this.current++;
	// 			break;
	// 		case 1:
	// 			item = rankCardGenerator2;
	// 			this.current++;
	// 			break;
	// 		case 2:
	// 			item = rankCardGenerator3;
	// 			this.current = 0;
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	return item;
	// }
	generateCard(level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name) {
		let key = genID(25);
		// eslint-disable-next-line no-async-promise-executor
		return new Promise(async (res, rej) => {
			try {
				while (this.waits.has(key)) {
					key = genID(25);
				}
				
				// await streamWrite(this.instance.stdin, prompt);
				// console.log(this.getCurrent());
				// eslint-disable-next-line no-undef
				rankCardGenerator.send([level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name, bgimg.endsWith(".gif") ? "gif" : "png", key].join(" "));
				// await streamWrite(rankCardGenerator.stdin,Buffer.from([level, xp, next, currentFormatted, nextFormatted, colorschemeR, colorschemeG, colorschemeB, rank, avatar, bgimg, name, bgimg.endsWith(".gif")?"gif":"png"].join(" "))).catch(er=>console.trace(er));
	
				this.waits.set(key, {
					cb: (path) => { console.log(path); res(path); },
				});
				console.log("written!");		
			} catch (error) {
				console.trace(error);
			}

		});
	}
}
module.exports = RankCardHandler;