const board = require("../../../commands/waifu/board");
const Grasslands = require("./Grasslands");
const Player = require("./items/Player");
const Start = require("./Start");
const FootPrint = require("./items/FootPrint");
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const fs = require("fs").promises;
const AllBoards = new Map();
AllBoards.set("Start", Start);
AllBoards.set("Grasslands", Grasslands);
const PlayerBoardMap = new Map();
const WASDMsgMap = new Map();
const footPrint = new FootPrint();
let sqlConnection;
class BoardManager {

	constructor(bot) {
		sqlConnection = bot.SQLHandler;
	}
	async initPlr(userid, boardmsg) {
		let userData = await sqlConnection.genericGet("spousefu", "userid", userid, true);
		if (!userData || !userData.started) return {
			failed: true,
			reason: "No Data!"
		};
		let board = AllBoards.get(userData.boardID);
		board = new board(this);
		let tile = this.getTileAt(board, userData.posx, userData.posy);
		let playerClass = new Player(this, "<a:TetPat:784235824849223680>");
		board.matrix[userData.posy][userData.posx] = playerClass;
		PlayerBoardMap.set(userid, {
			board: board,
			replacedTile: tile,
			posx: userData.posx,
			posy: userData.posy,
			playerOBJ: playerClass,
			boardmsg: boardmsg,
			currentDialog: [],
		});
		return true;
	}
	async getData(userid, boardmsg) {
		if (!PlayerBoardMap.has(userid)) {
			await this.initPlr(userid, boardmsg);
		}
		return PlayerBoardMap.get(userid);
	}
	getwasdMessage(userid) {
		return WASDMsgMap.get(userid);
	}
	addwasdMessage(userid, msg) {
		return WASDMsgMap.set(userid, msg);
	}
	async chainMove(userid, movestring) {
		let boardmsg = this.getwasdMessage(userid);
		if (!boardmsg) return;
		WASDMsgMap.delete(userid);
		if (movestring.toLowerCase() === "exit") {
			WASDMsgMap.delete(userid);
			boardmsg.edit({
				content: "",
				embed: {
					title: "Board Session Ended!"
				}
			});
			return;
		}

		let moves = movestring.toLowerCase().split("");
		moves = moves.map(x => {
			switch (x) {
			case "w":
				return 3;
			case "a":
				return 1;
			case "s":
				return 4;
			case "d":
				return 2;
			case "e":
				return 5;
			default:
				break;
			}
		});
		let currentBoard;
		let pastMoves = [];
		for (let i = 0; i < moves.length; i++) {
			let currentMove = moves[i];
			let data = PlayerBoardMap.get(userid);
			pastMoves.push([data.posx, data.posy]);
			currentBoard =await this.move(userid, currentMove, boardmsg, true);
			
			if (i % 1 == 0) {
				// for (let a = 0; a < pastMoves.length; a++) {
				// 	// console.log(pastMoves[a],currentBoard);
				// 	// currentBoard.matrix[ pastMoves[a][1] ] [ pastMoves[a][0] ] = footPrint;
				// 	// console.log(currentBoard.matrix[ pastMoves[a][1] ] [ pastMoves[a][0] ] );
				// }
				// // console.log(pastMoves);
				boardmsg.embeds[0].description = this.visualizeBoard(currentBoard);
				await boardmsg.edit({
					content: "Processing actions (Unresponsive in this mode!)",
					embed: boardmsg.embeds[0]
				});
				await sleep(0);
			}

		}
		boardmsg.embeds[0].description =this.visualizeBoard(currentBoard);
		await boardmsg.edit({
			content: boardmsg.content,
			embed: boardmsg.embeds[0]
		});
		WASDMsgMap.set(userid, boardmsg);

	}
	async move(userid, step, boardmsg, chainMove) {
		if (!PlayerBoardMap.has(userid)) {
			let res1 = await this.initPlr(userid, boardmsg);
			if (res1.failed) {
				return res1.reason;
			}
		}
		let userData = PlayerBoardMap.get(userid);
		let tempNewReplacdTile;
		// 1:left
		// 2:right
		// 3:up
		// 4:down
		let boardRef;
		let posxAdd = 0;
		let posyAdd = 0;
		switch (step) {
		case 1:
			posxAdd = -1;
			break;
		case 2:
			posxAdd = 1;
			break;
		case 3:
			posyAdd = -1;
			break;
		case 4:
			posyAdd = 1;
			break;
		default:
			break;
		}
		tempNewReplacdTile = this.getTileAt(userData.board, userData.posx + posxAdd, userData.posy + posyAdd);
		if (!tempNewReplacdTile || tempNewReplacdTile.collidable) {
			return this.visualizeBoard(userData.board);
		}
		boardRef = userData.board;
		boardRef.matrix[userData.posy + posyAdd][userData.posx + posxAdd] = userData.playerOBJ;
		boardRef.matrix[userData.posy][userData.posx] = userData.replacedTile;
		userData.board = boardRef;
		userData.posx = userData.posx + posxAdd;
		userData.posy = userData.posy + posyAdd;
		userData.replacedTile = tempNewReplacdTile;
		if (userData.replacedTile.onTrigger && await userData.replacedTile.onTrigger(userData.board, this, userid)) {
			return chainMove ? userData.board : this.visualizeBoard(PlayerBoardMap.get(userid).board);
		}

		PlayerBoardMap.set(userid, userData);
		return chainMove ? userData.board : this.visualizeBoard(userData.board);



	}
	changeBoard(userid, newBoardName, newposx, newposy) {
		let pbmData = PlayerBoardMap.get(userid);
		let board = AllBoards.get(newBoardName);
		board = new board(this);
		let tile = this.getTileAt(board, newposx, newposy);
		let playerClass = pbmData.playerOBJ;
		let boardmsg = pbmData.boardmsg;
		board.matrix[newposy][newposx] = playerClass;
		PlayerBoardMap.set(userid, {
			board: board,
			replacedTile: tile,
			posx: newposx,
			posy: newposy,
			playerOBJ: playerClass,
			boardmsg: boardmsg,
			currentDialog: pbmData.currentDialog,
		});
		return true;
	}
	visualizeBoard(board) {
		//NeedToHandleBigBoard
		return board.matrix.map(x => x.map(y => y.emoji).join("")).join("\n");
	}
	getTileAt(board, x, y) {

		return board.matrix[y] ? board.matrix[y][x] : null;
	}
	addDialog(userid,text){
		if (text.length > 1048) return;
		if (!PlayerBoardMap.has(userid)) {
			return false;
		}
		let data = PlayerBoardMap.get(userid);
		let dialoog = data.currentDialog;
		data.currentDialog.unshift(text);
		let diaCopy = [].concat(dialoog);

		let embed = data.boardmsg.embeds[0];
		let newstr = "";
		while (diaCopy.length){
			let item = diaCopy.shift();
			if (newstr.length + item.length > 1024) break;
			newstr += item.length;
		}
		embed.fields[0].value = newstr;
	}


}
module.exports = BoardManager;