const DazaiOsamu = require("./waifuwars/waifus/DazaiOsamu");

//------------------------------------------------ BASIC CONSTS
function shuffleArray(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
}
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const fs = require("fs").promises;
//------------------------------------------------
let bot;
let sqlConnection;
let userBattleMap = new Map();
let waifuCache = new Map();
let waifuRef = new Map();
(() => {
	waifuRef.set("dazai", DazaiOsamu);
})();
class WaifuWarsHandler {
	constructor(b) {
		bot = b;
		sqlConnection = b.SQLHandler;
	}
	async startFight(user1, user2) {
		if (userBattleMap.has(user1.id)) return {
			failed: true,
			code: 801,
			message: `Battle Start Failed! ${user1.username}#${user1.discriminator} is currently in a battle right now!`
		};
		if (userBattleMap.has(user2.id)) return {
			failed: true,
			code: 801,
			message: `Battle Start Failed! ${user2.username}#${user2.discriminator} is currently in a battle right now!`
		};
		let user1Waifus = await sqlConnection.genericGet("userwaifus", "userid", user1.id);
		let user2Waifus = await sqlConnection.genericGet("userwaifus", "userid", user2.id);
		if (!user1Waifus.main) return {
			failed: true,
			code: 802,
			message: `Battle Start Failed! ${user1.username}#${user1.discriminator} does not have a team of waifu's set! (Settable with daz setWaifu)`
		};
		if (!user2Waifus.main) return {
			failed: true,
			code: 802,
			message: `Battle Start Failed! ${user2.username}#${user2.discriminator} does not have a team of waifu's set! (Settable with daz setWaifu)`
		};
		user1Waifus.main = JSON.parse(user1Waifus.main);
		user2Waifus.main = JSON.parse(user2Waifus.main);
		let verifiedWaifus = await Promise.all(user1Waifus.main.map(async (x, ind) => {
			let waifu = await this.getWaifu(x);
			if (!waifu) {
				return `Could Not Start Battle! ${user1.username}#${user1.discriminator} : Unknown Waifu with ID \`${x}\``;
			}
			if (!waifu.currentOwner !== user1.id) {
				return `Could Not Start Battle! ${user1.username}#${user1.discriminator} : Current owner does not match with waifu id \`${x}\``;
			}
			return waifu;
		}));
		let user1vWErrors = verifiedWaifus.filter(x => typeof x === "string");
		if (user1vWErrors.length) {
			return {
				failed: true,
				code: 803,
				message: `Errors: \`\`\`${user1vWErrors.join("\n")}\`\`\``
			};
		}
		//User1 Verification Waifu Errors
		let verifiedWaifus2 = await Promise.all(user2Waifus.main.map(async (x, ind) => {
			let waifu = await this.getWaifu(x);
			if (!waifu) {
				return `Could Not Start Battle! ${user2.username}#${user2.discriminator} : Unknown Waifu with ID \`${x}\``;
			}
			if (!waifu.currentOwner !== user1.id) {
				return `Could Not Start Battle! ${user2.username}#${user2.discriminator} : Current owner does not match with waifu id \`${x}\``;
			}
			return waifu;
		}));
		let user2vWErrors = verifiedWaifus2.filter(x => typeof x === "string");
		if (user2vWErrors.length) {
			return {
				failed: true,
				code: 803,
				message: `Errors: \`\`\`${user2vWErrors.join("\n")}\`\`\``
			};
		}
		//Verify Users have waifu's and generate
		verifiedWaifus = verifiedWaifus.map(x => {
			let clas = waifuRef.get(x.waifuType);
			let waifu = new clas(x.waifuLevel,x.waifuExp,user1,false);
			return waifu;
		});
		verifiedWaifus2 = verifiedWaifus2.map(x => {
			let clas = waifuRef.get(x.waifuType);
			let waifu = new clas(x.waifuLevel,x.waifuExp,user1,false);
			return waifu;
		});
		

	}
	async getWaifu(id) {
		let res = await sqlConnection.genericGet("waifulist", "waifuID", id);
		waifuCache.set(id, res);
		return res;

	}
}
