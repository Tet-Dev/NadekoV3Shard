// require("@tensorflow/tfjs");
// require('@tensorflow/tfjs-node');
// const toxicity = require("@tensorflow-models/toxicity");
// const qna = require("@tensorflow-models/qna");
// let qnaModel;
const { google } = require("googleapis");
// const 

let API_KEY = process.env.MODERATORAIKEY;
let DISCOVERY_URL =process.env.MODERATORAIURL;

// let ToxicClassify;
let bot;
// let ready;
let queue = [];
let AIClassification;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
class AIManager {
	constructor(b) {
		bot = b;
		this.init();
	}
	async init() {
		AIClassification = await google.discoverAPI(DISCOVERY_URL);
		this.handleQueue();
	}
	getComment(data) {
		return new Promise((res, rej) => {
			AIClassification.comments.analyze({
				key: API_KEY,
				resource: data
			},
			(err, response) => {
				if (err) return rej(err);
				res(response.data);
				// console.log(JSON.stringify(response.data, null, 2));
			});
		});
	}
	async handleQueue() {
		while (!AIClassification) await sleep(10);
		while (true) {
			while (queue.length == 0) await sleep(10);
			let comment = queue.shift();
			// comment.data
			try {
			
				const analyzeRequest = {
					comment: {
						text: comment.data.content,
					},
					requestedAttributes: {
						TOXICITY: {},
						SEVERE_TOXICITY: {},
						IDENTITY_ATTACK: {},
						INSULT: {},
						PROFANITY: {},
						THREAT: {},
						SEXUALLY_EXPLICIT: {},
						FLIRTATION: {},
					}
				};
				let res = await this.getComment(analyzeRequest);
				comment.resfunc(res);
				await sleep(250);
			} catch (error) {
				// console.trace(error);
				comment.rej(error);
			}

		}
	}
	
	analyzeComment(msg){
		return new Promise((res,rej)=>{
			
			queue.push({
				data: msg,
				
				resfunc: res,
				rej:rej
			});
		});
	}



}
module.exports = AIManager;