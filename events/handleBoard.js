const { DiscordEvent } = require("eris-boiler/lib");

module.exports = new DiscordEvent({
	name: "messageReactionAdd",
	run: async (bot, msg, emoji, reactor) => {
		if (emoji.id) return;
		if (!msg.author){
			msg = await bot.getMessage(msg.channel.id,msg.id);
		}
		if (msg.author.id === bot.user.id) {
			if (msg.content.startsWith("Spousefu Board for ") ) {
				let auth = msg.content.match(/\d+/)[0];
				if ((reactor.id || reactor) !== auth) return;
				let val = 0;
				switch (emoji.name) {
				case "◀️":
					val=1;
					break;
				case "▶️":
					val=2;
					break;
				case "🔼":
					val=3;
					break;
				case "🔽":
					val=4;
					break;
				case "🟡":
					val=5;
					break;
				default:
					break;
				}
				if (!msg.author) msg = await bot.getMessage(msg.channel.id,msg.id);
				await msg.removeReaction(emoji.name, reactor.id || reactor);
				let newboard = await bot.BoardManager.move(auth, val).catch(er=>console.trace(er));
				if (!msg.embeds.length) return;
				msg.embeds[0].description = newboard;
				await msg.edit({embed:msg.embeds[0]});
			}
		}
	}
});
