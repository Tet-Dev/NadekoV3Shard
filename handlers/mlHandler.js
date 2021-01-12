/* eslint-disable no-async-promise-executor */
// const SQLHandler = require("../../sqlHandler/SQLCommunicator");
let sqlConnection = null;
let bot;
let LinkMap;
let shopOffers;
let ColorMap;
const queue = [];
const { dockStart } = require("@nlpjs/basic");
let nlp;
let ready = false;

async function processResp(msg) {
	if (!ready) {
		return;
	}
	let resp = await nlp.process("en", msg.content).catch(er => console.trace(er));
	if (!resp.answer) return;
	await msg.channel.createMessage({
		content: resp.answer.replace(/{MENTION}/g, msg.author.mention),
		// embed: {
		// 	footer: {
		// 		text: `Confidence ${Math.floor(resp.score * 10000) / 100}%`
		// 	}
		// },
		messageReference: {
			message_id: msg.id,
			channel_id: msg.channel.id,
		}
	});
}
// content.messageReference
//------------------------------------------------ BASIC CONSTS
function shuffleArray(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const fs = require("fs").promises;
//------------------------------------------------
async function startQueue() {
	// eslint-disable-next-line no-constant-condition
	while (true) {
		while (!queue.length) {
			await sleep(1);
		}
		let data = await fs.readFile("mlData.txt");
		let item = queue.shift();
		data = JSON.parse(data);
		data.push({
			prompt: item.prompt,
			promptuserInfo: item.pui,
			ans: item.ans,
			ansuserInfo: item.aui,
		});
		await fs.writeFile("mlData.txt", JSON.stringify(data));
		// fs.appendFile("mlData.txt", "utf8",
		// 	// callback function
		// 	function(err) { 
		// 		if (err) throw err;
		// 		// if no error
		// 	});
		//Queue Code
	}
}
startQueue();

class MLHandler {
	constructor(b) {
		sqlConnection = b.SQLHandler;
		bot = b;

	}
	async getResponse(msg) {
		if (msg.channel.topic && (msg.channel.topic === "dazAI time")) {
			processResp(msg);
		}
	}
	async init() {
		const dock = await dockStart({ use: ["Basic", "Qna"] });
		nlp = dock.get("nlp");
		await nlp.load("./Models/talk.nlp").catch(er => console.trace(er));
		ready = true;

	}
}
module.exports = MLHandler;