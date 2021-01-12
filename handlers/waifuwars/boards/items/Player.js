const Building = require("./Building");

class Player extends Building{
	constructor(boardManager,emote){
		super(false,emote,{
		});
	}
	setPlayerEmote(emote){
		this.emoji = emote;
	}
}
module.exports = Player;