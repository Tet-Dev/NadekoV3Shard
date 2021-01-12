const { DiscordEvent } = require("eris-boiler/lib");

module.exports = new DiscordEvent({
	name: "messageCreate",
	run: async (bot, msg) => {
		let pmsg = bot.BoardManager.getwasdMessage(msg.author.id);
		if (!pmsg) return;
		if (pmsg.channel.id !== msg.channel.id) return;
		let movements= msg.content.match(/([WASDE])|([wasde])/g);
		if (msg.content.toLowerCase() !== "exit" && (!movements || movements.length != msg.content.length)){
			return;
		}
		msg.delete();
		await bot.BoardManager.chainMove(msg.author.id,msg.content.toLowerCase());
	}
});
