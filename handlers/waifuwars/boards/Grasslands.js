const Board = require("./BaseBoard");
const Door = require("./items/Door");
const Void = require("./items/Void");
const Wall = require("./items/Wall");
const w = new Wall();
const v = new Void();
const boardMatrix=[
	[w,w,w,w,w,w,w,w,w,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,v,v,v,v,v,v,v,v,w],
	[w,w,w,w,w,w,w,w,w,w],
];


class Grasslands extends Board{
	constructor(boardManager){
		super(boardMatrix,boardManager,"Grasslands");
	}
}
module.exports = Grasslands;