const Building = require("./Building");

class Wall extends Building{
	constructor(){
		super(true,"🟦");
	}
}
module.exports =Wall;