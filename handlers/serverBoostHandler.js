let bot;
let sql;
let boostMap = new Map();
let boostList = [];
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
function binarySearch(arr,item){
	function bs(arr,min,max){
		if (arr.length == 1) return min;
		let split = arr[Math.floor((min+max)/2)];
		if (split.expires > item.expires) return bs(arr,min,Math.floor((min+max)/2));
		if (split.expires < item.expires) return bs(arr,Math.floor((min+max)/2),max);
		if (split.expires == item.expires) return Math.floor((min+max)/2);
	}
	return bs(arr,0,arr.length);
}
class ServerBoostManager {
	constructor(b) {
		bot = b;
		sql = b.SQLHandler;
		this.init();
	}
	async getUserData(userid) {
		return sql.genericGet("userboosts", "userid", userid);
	}
	async getUserBoosts(userid) {
		let data = await this.getUserData(userid);
		return data;
	}
	async getUserSBoosts(userid){
		return boostList.filter(x=> x.userid === userid);
	}
	async getServerBoosts(guildID) {
		return sql.genericGet("boosts", "guild", guildID);
	}
	async boostServer(userid, guildID, type) {
		let failed = true;
		let tries = 0;
		let id = genID(10);
		let userdata = await this.getUserData(userid);
		if (userdata && userdata[type] <= 0) return {
			boosted: false,
			reason: "You do not have that boost!"
		};
		userdata[type]--;
		delete userdata[userid];
		await sql.genericUpdate("userboosts", "userid", userid, userdata);
		while (failed && tries < 100) {
			if (boostList.filter(x=>x.id === id).length) {
				id = genID(10);
				tries++;
			}
			else {
				failed = false;
				break;
			}
		}
		if (failed) return {
			boosted: false,
			reason: "Backend Error while assigning boost! Try again?"
		};
		let time;
		//userid, 1dayBoosts, 2dayBoosts, 5dayBoosts, 1weekBoosts, 1monthBoosts, autoTakeBoosts, activeBoosts
		switch (type) {
		case "1dayBoosts":
			time = 86400;
			break;
		case "2dayBoosts":
			time = 86400 * 2;
			break;
		case "5dayBoosts":
			time = 86400 * 5;
			break;
		case "1weekBoosts":
			time = 86400 * 7;
			break;
		case "1monthBoosts":
			time = 86400 * 30;
			break;
		case "1yearBoosts":
			time = 86400 * 365.25;
			break;
		default:
			break;
		}
		let dataobj = {

			expires: Math.round(Date.now() / 1000) + time,
			guild: guildID,
			userid: userid,

		};

		await sql.genericSet("boosts", "boostID", id, dataobj).catch(er=>console.trace(er));
		dataobj.boostID = id;
		// let bsearch = binarySearch(boostList,dataobj);
		boostList.push(dataobj);
		boostList.sort((a, b) => a.expires - b.expires);
		return {
			boosted : true,
		};
		
	}
	async init() {
		boostList = await sql.genericGetAll("boosts");

		boostList.sort((a, b) => a.expires - b.expires);
		//Handle Queue
		// eslint-disable-next-line no-constant-condition
		while (true) {
			let time = Math.floor(Date.now() / 1000);
			// console.log(boostList);
			let amnt = 0;
			boostList.forEach((item)=>{
				if (item.expires <= time) return amnt++;
			})
			// boostList.reduce((accum, item) => {
			//
			// 	accum = accum || 0;
			// 	console.log(accum);
			// 	console.log(item.expires <= time,item.expires,time,);
			// 	if (item.expires <= time) return accum+1;
			// 	return accum;
			// });
			let burnQueue = boostList.splice(0, amnt);
			// console.log(burnQueue);
			// let pplToDM = new Map();
			burnQueue.forEach(x => {
				// pplToDM.set(x,(pplToDM.get(x)|| []).concat(x));
				sql.genericDelete("boosts", "boostID", x.boostID).catch(er=>console.trace(er));
			});
			await sleep(60000);
		}
	}
}
module.exports = ServerBoostManager;