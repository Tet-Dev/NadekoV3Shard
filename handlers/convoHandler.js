const Conversation = require("./conversation");
let bot;
let sql;
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
class ConvoHandler {
	constructor(b) {
		bot = b;
		sql = bot.SQLHandler;
		this.convoMaps = new Map();
	}
	async convoExists(channelid) {
		return this.convoMaps.get(channelid);
	}
	getConvo(channelid) {
		this.convoMaps.get(channelid);
	}
	async createConvo(channelid, modelType, sfw, premium) {
		let newConvo = new Conversation(bot, this, channelid, modelType, sfw, premium);
		while (!newConvo.isReady()) {
			await sleep(100);
		}
		return newConvo;
	}
	async getMessagesLeft(guildid) {
		let gdata = await sql.getGuild(guildid);
		return gdata.AImessagesLeft;
	}
	async deductMessagesLeft(guildid, amnt) {
		let messages = await this.getMessagesLeft(guildid);
		messages -= amnt;
		await this.setMessagesLeft(guildid, messages);
		return;
	}
	async addMessagesLeft(guildid, amnt) {
		let messages = await this.getMessagesLeft(guildid);
		messages += amnt;
		await this.setMessagesLeft(guildid, messages);
		return;
	}
	async setMessagesLeft(guildid, amnt) {
		await sql.updateGuild(guildid, { AImessagesLeft: amnt });
		return;
	}
	async processConvo(msg) {
		try {
			let convoChannel;
			if (!this.convoMaps.get(msg.channel.id)) {
				let data = await sql.getChannel(msg.channel.id);
				if (!data.aiChatOn) {
					return false;
				}
				let newConvo = await this.createConvo(msg.channel.id, data.aiChatOn == 2 ? "premium" : "regular", !msg.channel.nsfw, false);
				this.convoMaps.set(msg.channel.id, newConvo);
				convoChannel = newConvo;
			} else {
				convoChannel = this.convoMaps.get(msg.channel.id);
			}
			let resp = await convoChannel.processMessage(msg, false);
			return resp;
		} catch (error) {
			console.trace(error);
		}

	}

}
module.exports = ConvoHandler;