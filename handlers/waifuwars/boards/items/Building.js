class Building {
	// otherProperties : {
	// 	onTrigger (Async Function?):
		
	// }
	constructor(collidable,emoji,otherProperties){
		this.collidable = collidable;
		this.emoji = emoji;
		Object.assign(this,otherProperties);
	}
}
module.exports = Building;