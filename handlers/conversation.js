const {spawn} = require("child_process");
const {streamWrite, streamEnd, onExit} = require("@rauschma/stringio");
const { default: Axios } = require("axios");
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

class Conversation {
	constructor(bot, convoManager, channelID, modelType, sfw, premium) {
		this.ready = true;
		this.bot = bot;
		this.convoManager = convoManager;
		this.channelID = channelID;
		this.modelType = modelType;
		this.getLastTime = Date.now();
		this.sfw = sfw;
		this.premium = premium;
		
	}

	isReady() {
		return this.ready;
	}

	// async init() {
	//     let modelDir;
	//     switch (this.modelType) {
	//         case "regular":
	//             modelDir = "zoo:blender/blender_90M/model";
	//             break;
	//         case "premium":
	//             modelDir = "zoo:blender/blender_400Mdistill/model";
	//             break;
	//         default:
	//             modelDir = "zoo:blender/blender_90M/model";
	//             break;
	//     }
	//     let sfw = this.sfw ? "AI/parlai/scripts/safe_interactive.py" : "AI/parlai/scripts/interactive.py";
	//     this.instance = spawn("python", [sfw, "-t", "blended_skill_talk", "-mf", modelDir]);
	//     this.stdOutHandler = new stdOutHandler(this.instance);

	//     function promisify() {
	//         return new Promise(((resolve, reject) => {
	//             this.instance.once("data", (data) => {
	//                 if (data.startsWith("Enter Your Message: ")) {
	//                     resolve();
	//                 }
	//             });

	//         }))
	//     }

	//     await promisify();
	//     this.ready = true;
	// }

	async processMessage(msg, silent) {
		if (!this.ready) return false;
		if (!msg.content) return false;
		if (msg.attachments.length) return false;
		let messageData = await this.convoManager.getMessagesLeft(msg.guildID);
		if (messageData <= 0) return false;
		msg.channel.sendTyping();
		await this.convoManager.deductMessagesLeft(msg.guildID,1);
		this.getLastTime = Date().now;
		let data = await Axios.post(this.modelType === "premium"?"https://dazai-ai-api.loca.lt/ai/askQuestion":"https://dazai-ai-api.loca.lt/ai/askCheapQuestion",{
			code : "5ziej8ixgtmyvbd7nm6bpcab7seaf2zkpue9au25",
			guildID: msg.guildID,
			channelID: msg.channel.id,
			content: msg.content
		}).catch(er=>console.log(er));
		if (!data){ await this.convoManager.addMessagesLeft(msg.guildID,1);return "Error processing message";}
		// let resp = await this.stdOutHandler.getResponse(msg.content);
		let resp = data.data;
		if (silent) return resp;
		msg.channel.createMessage({
			embed: {
				footer: {
					text: `${messageData - 1} messages left for this guild.`
				}
			},
			content: `${msg.author.mention}, ${resp.response}`,
		});
	}

	shouldPrune() {
		let timedif = this.premium ? 600000 : 300000;
		if (Date.now() > this.getLastTime + timedif) return true;
		return false;
	}


}

// class stdOutHandler {
//     constructor(instance) {
//         this.instance = instance;
//         this.startFetch();
//         this.queue = [];
//     }

//     async startFetch() {
//         this.instance.on("data", (data) => {
//             if (data.startsWith("[TransformerGenerator]: ")) {
//                 let firstCallback = this.queue.shift();
//                 firstCallback(data.replace("[TransformerGenerator]: ", "").replace(/  /g, ""));
//                 // resolve();
//             }
//         });
//     }

//     getResponse(prompt) {
//         return new Promise((async (resolve, reject) => {
//             await streamWrite(this.instance.stdin, prompt);
//             let set;
//             this.queue.push((msg) => {
//                 set = msg;
//             });
//             while (!set) {
//                 await sleep(100);
//             }
//             resolve(set);
//         }));

//     }
// }

module.exports = Conversation;