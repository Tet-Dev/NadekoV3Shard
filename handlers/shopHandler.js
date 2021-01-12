/* eslint-disable no-async-promise-executor */

const { has } = require("lodash");

// const SQLHandler = require("../../sqlHandler/SQLCommunicator");
function SecsToFormat(string) {
	let sec_num = parseInt(string, 10);
	let hours = Math.floor(sec_num / 3600);
	let minutes = Math.floor((sec_num - hours * 3600) / 60);
	let seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return hours + ":" + minutes + ":" + seconds;
}
let sqlConnection = null;
let bot;
let LinkMap;
let shopOffers;
let ColorMap;
const RarityColors = {
	common: [150, 150, 150],
	rare: [102, 207, 255],
	super_rare: [135, 255, 159],
	uber: [230, 169, 255],
	legendary: [255, 204, 0],
	event: [-1, -1, -1],

};
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
const totalShopItems = 5;

async function getInventory(userID) {
	let sql = "SELECT * FROM nadekoguilddata.dazaiinventory WHERE userID = '" + userID + "'";
	let allItems = await (sqlConnection.query(sql));
	while (allItems.length < 1) {
		await sqlConnection.query("INSERT INTO `nadekoguilddata`.`dazaiinventory` (`userID`, `inventory`) VALUES ('" + userID + "', '[]')").catch(er => { console.trace(er); });
		allItems = await sqlConnection.query(sql);
	}
	let item = allItems[0];
	return JSON.parse(item.inventory);

}
function setInventory(userID, inventory) {
	return new Promise(async function (resolve, reject) {
		try {
			await sqlConnection.query("UPDATE `nadekoguilddata`.`dazaiinventory` SET `inventory` = '" + JSON.stringify(inventory) + "' WHERE (`userID` = '" + userID + "')");
			resolve(true);
		} catch (error) {
			reject(error);
		}
	});
}
function removeItemFromInventory(userID, idName, extraparams) {
	return new Promise(async function (resolve, reject) {
		try {
			let inventory = await getInventory(userID);
			let serial;
			try {
				serial = extraparams.serial;
			} catch (error) {
				console.trace(error);
			}
			let removed = false;
			inventory = inventory.filter(x => {
				if ((x.id === idName && !removed) && ((!serial && serial !== 0) || x.serial === serial)) {
					removed = true;
					return false;
				}
				return true;
			});
			await setInventory(userID, inventory);
			resolve(true);
		} catch (error) {
			reject(error);
		}
	});
}
function addItemToInventory(userID, idName, extraparams) {
	return new Promise(async function (resolve, reject) {
		try {
			let inventory = await getInventory(userID);
			// {serial: inf.currentNum}
			inventory.push({
				id: idName,
				serial: extraparams ? extraparams.serial : undefined
			});
			await setInventory(userID, inventory);
			resolve(true);
		} catch (error) {
			console.trace(error);
			reject(error);
		}
	});
}
async function createShopOffers(weights, amnt, base, noDupes) {
	weights = weights || { none: true };
	base = [];
	function generateItemType(weights) {
		let commonWeight = { id: 1, weight: weights.common || 20 };
		let rareWeight = { id: 2, weight: weights.rare || 10 };
		let superRareWeight = { id: 3, weight: weights.srare || 5 };
		let uberRareWeight = { id: 4, weight: weights.uber || 2 };
		let legendaryWeight = { id: 5, weight: weights.legendary || 1 };
		let weightArr = [commonWeight, rareWeight, superRareWeight, uberRareWeight, legendaryWeight];
		while (weightArr.filter(n => (n.weight - Math.floor(n.weight)) !== 0).length) {
			weightArr = weightArr.map(x => x * 10);
		}
		let chooseArr = [];
		function addtoArr(amnt, item) {
			for (let i = 0; i < amnt; i++) {
				chooseArr.push(item);
			}
		}
		addtoArr(commonWeight.weight, "common");
		addtoArr(rareWeight.weight, "rare");
		addtoArr(superRareWeight.weight, "super_rare");
		addtoArr(uberRareWeight.weight, "uber");
		addtoArr(legendaryWeight.weight, "legendary");
		let choice = chooseArr[Math.floor(Math.random() * chooseArr.length)];
		return (choice);
	}
	let offers = base || [];
	for (var i = 0; i < amnt; i++) {
		let rarity = generateItemType(weights);
		let pushItem;
		if (noDupes) {
			// let tries = 0; 
			let suc;
			for (let tries = 0; tries < 8; tries++) {
				let rarity = generateItemType(weights);
				suc = false;
				let potentialOffers = shopOffers.filter(x => x.rarity.toLowerCase() === rarity && !x.nodraw);
				while (!potentialOffers.length) {
					rarity = generateItemType(weights);
					potentialOffers = shopOffers.filter(x => x.rarity.toLowerCase() === rarity && !x.nodraw);
				}
				pushItem = potentialOffers[Math.floor(Math.random() * potentialOffers.length)];
				let quickmap = offers.map(x => x.idName);
				if (!quickmap.includes(pushItem.idName)) {
					suc = true;
					break;
				}

			}
			if (!suc) {
				pushItem = null;
			}
		} else {
			let potentialOffers = shopOffers.filter(x => x.rarity.toLowerCase() === rarity && !x.nodraw);
			while (!potentialOffers.length) {
				rarity = generateItemType(weights);
				potentialOffers = shopOffers.filter(x => x.rarity.toLowerCase() === rarity && !x.nodraw);
			}
			pushItem = potentialOffers[Math.floor(Math.random() * potentialOffers.length)];
		}
		if (pushItem) {
			offers.push(pushItem);
		}

	}
	return offers;
	// for (let [key, value] of myMap.entries()) {
	//   }
	// let totalWeight = 0;
	// weightArr.forEach((x)=>totalWeight+=x);
	// let selectedWeight = getRandomInt(weightArr.sort((a,b)=> a.weight-b.weight)[0].weight,totalWeight+1);

	// weightArr.filter()
}
async function refreshUserShop(userid, weights, noDupes, base, extraamnt) {

	// (JSON.stringify(offerz).replace(/\"/g, "\\\""))
	return new Promise(function (resolve) {
		// customthings = customthings || [];
		createShopOffers(weights, totalShopItems + (extraamnt || 0), (base || []), (noDupes || false)).then(offers => {
			sqlConnection.query("UPDATE `nadekoguilddata`.`dazaishop` SET `offers` = \"" + (JSON.stringify(offers).replace(/\"/g, "\\\"")) + "\" WHERE `userid` = '" + userid + "'").then(() => {
				getUserShopItems(userid).then(res => resolve(res));
			});
		});

	});
}
async function getUserShopItems(userid) {
	return new Promise(function (resolve) {
		sqlConnection.query("SELECT * FROM nadekoguilddata.dazaishop WHERE userid = '" + userid + "'").then(x => {
			if (x && x.length && x[0]) {
				resolve(x[0].offers);
			} else {
				createShopOffers(null, totalShopItems).then(offers => {

					let sqlstate = "INSERT INTO `nadekoguilddata`.`dazaishop` (`userid`, `offers`) VALUES ('" + userid + "', \"" + (JSON.stringify(offers).replace(/\"/g, "\\\"")) + "\")";
					sqlConnection.query(sqlstate).then(() => {
						getUserShopItems(userid).then(info => resolve(info));
					});
				});

			}
		});
	});
}

class ShopHandler {
	constructor(b) {
		sqlConnection = b.SQLHandler;
		bot = b;
		LinkMap = b.LinkMap;
		shopOffers = b.shopOffers;
		ColorMap = b.ColorMap;
	}
	async getItemInfo(itemName) {
		let data = await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`itemlist` WHERE itemID = \"" + sqlConnection.clean(itemName) + "\"");
		return (data ? data[0] : null);
	}
	async incItemInfo(itemName) {
		let itf = await this.getItemInfo(itemName);
		await sqlConnection.query("UPDATE `nadekoguilddata`.`itemlist` SET `currentNum` = '" + (itf.currentNum + 1) + "' WHERE (`itemID` = '" + itemName + "')");
	}
	async getAllItems() {
		let data = await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`itemlist`");
		return (data && data[0] ? data : null);
	}
	async getAllTrades(userID) {
		userID = userID? sqlConnection.clean(userID) : "";
		let data = await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`trades`" + (userID ? "WHERE trader= '" + userID + "'" : ""));
		return (data && data[0] ? data : []);
	}
	async getTrade(tradeID) {
		tradeID = sqlConnection.clean(tradeID);
		let data = await sqlConnection.query("SELECT * FROM `nadekoguilddata`.`trades`" + (tradeID ? "WHERE tradeID= '" + tradeID + "'" : ""));
		return (data && data[0] ? data[0] : null);
	}
	async getInventory(userid) {
		return await getInventory(userid);
	}
	async addItemToInventory(userID, idName, extraparams) {
		return await addItemToInventory(userID, idName, extraparams);
	}
	async removeItemFromInventory(userID, idName, extraparams) {
		return await removeItemFromInventory(userID, idName, extraparams);
	}
	async setInventory(userID, inventory) {
		return await setInventory(userID, inventory);
	}
	async getUserShopItems(userid) {
		return await getUserShopItems(userid);
	}
	
	async addWaifuToUser(userID,waifuName){
		let newID =genID(15);
		let hasWaifu = await sqlConnection.genericGet("waifulist", "waifuID", newID,true);
		while (hasWaifu && hasWaifu.waifuType){
			newID =genID(15);
			hasWaifu = await sqlConnection.genericGet("waifulist", "waifuID", newID,true);
		}
		await sqlConnection.genericUpdate("waifulist","waifuID",newID,{
			waifuType: waifuName,
			currentOwner: userID
		});
		await this.addItemToInventory(userID,waifuName,{
			serial: newID
		});
		await sqlConnection.genericUpdate("userwaifus","userid",userID,{
			started: 1,
		}); 
	}
	async getWaifu(id) {
		let res = await sqlConnection.genericGet("waifulist", "waifuID", id);
		return res;

	}
	async setBGCust(userid, bgid) {
		try {


			// let item = await this.getItemInfo(bgid);
			// if (!item) return "Could not find Background!";
			// if (item.type !== "Card Background") return "Not a Background!";
			let usrinv = await {
				allItems: await this.getAllItems(),
				inventory: await getInventory(userid),
			};
			let itemData = await usrinv.allItems.filter(x => x.itemID === bgid)[0];
			if (!itemData) return "Could not find Background!";
			if (itemData.type !== "Card Background") return "Not a Background!";
			let amnt = usrinv.inventory.filter(x => x.id === bgid).length;
			if (amnt == 0 && !itemData.free) return "You Don't own a copy of this!";
			let hprefs = await bot.LevellingHandler.getStylePrefs(userid);
			if (!hprefs) {
				await sqlConnection.query("INSERT INTO `nadekoguilddata`.`personaldata` (`userid`) VALUES ('" + sqlConnection.clean(userid) + "')");
			}
			await sqlConnection.query("UPDATE `nadekoguilddata`.`personaldata` SET `personalbg` = '" + sqlConnection.clean(bgid) + "' WHERE (`userid` = '" + sqlConnection.clean(userid) + "')");

			return `Set ${bgid} as your new Card Background!`;// if ()
		} catch (error) {
			console.trace(error);
		}
	}
	async setCSCust(userid, csid) {
		// let item = await this.getItemInfo(bgid);
		// if (!item) return "Could not find Background!";
		// if (item.type !== "Card Background") return "Not a Background!";
		let usrinv = await {
			allItems: await this.getAllItems(),
			inventory: await getInventory(userid),
		};
		let itemData = await usrinv.allItems.filter(x => x.itemID === csid)[0];
		if (!itemData) return "Could not find Color Scheme!";
		if (itemData.type !== "Color Scheme") return "Not a Color Scheme!";
		let amnt = usrinv.inventory.filter(x => x.id === csid).length;
		if (amnt == 0 && !itemData.free) return "You Don't own a copy of this!";
		let hprefs = await bot.LevellingHandler.getStylePrefs(userid);
		if (!hprefs) {
			await sqlConnection.query("INSERT INTO `nadekoguilddata`.`personaldata` (`userid`) VALUES ('" + sqlConnection.clean(userid) + "')");
		}
		await sqlConnection.query("UPDATE `nadekoguilddata`.`personaldata` SET `personalcolor` = '" + sqlConnection.clean(csid.replace("CS", "")) + "' WHERE (`userid` = '" + sqlConnection.clean(userid) + "')");
		// if ()
		return `Set ${csid} as your new Color Scheme!`;
	}
	async refreshShops() {
		let allUsers = await sqlConnection.query("SELECT * FROM nadekoguilddata.dazaishop");
		allUsers = allUsers.map(x => x.userid);
		let allpromises = [];
		allUsers.forEach(x => allpromises.push(refreshUserShop(x)));

	}
	
}
module.exports = ShopHandler;