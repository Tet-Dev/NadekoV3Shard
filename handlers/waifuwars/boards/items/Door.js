const Building = require("./Building");

class Door extends Building{
	constructor(toBoard,startingPosX,startingPosY){
		super(false,"🚪",{
			onTrigger: (currentBoard,boardManager,userid)=>{
				boardManager.changeBoard(userid,toBoard,startingPosX,startingPosY);
				return true;
			}
		});
	}
}
module.exports = Door;