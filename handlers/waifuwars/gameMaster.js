/* eslint-disable no-async-promise-executor */

const { map } = require("lodash");

// const SQLHandler = require("../../sqlHandler/SQLCommunicator");
let sqlConnection = null;
let bot;
let battles = new Map();
function genID(length) {
	var result = "";
	var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
function findwaifu(battle, id) {
	return battle.user1waifus.filter(x => x.battleid === id).concat(battle.user2waifus.filter(x => x.battleid === id));
}
function getwaifuOwner(battle, id) {
	return battle.user1waifus.filter(x => x.battleid === id).length ? battle.user1 : battle.user2;
}
function broadcastMessage(channelIDs, message) {
	(channelIDs[0] ? channelIDs : [channelIDs]).forEach(async (x) => {
		bot.createMessage(x, message);
	});
}
class gameMaster {
	constructor(b) {
		sqlConnection = b.SQLHandler;
		bot = b;

	}
	get(id) {
		return battles.get(id);
	}
	startBattle(user1, user2, user1waifus, user2waifus) {
		let rand = genID(10);
		while (battles.has(rand)) {
			rand = genID(10);
		}
		let tind = 0;
		battles.set(rand, {
			user1: user1,
			user2: user2,
			user1waifus: user1waifus.map(x => { x.battleid = tind; tind++; return x; }),
			user2waifus: user2waifus.map(x => { x.battleid = tind; tind++; return x; }),
			user1attacks:0,
			user2attacks:0,
			turn:0,
			fightqueue: [],
		});
		return rand;
	}
	addAttackToQueue(battleID, waifuAttack, waifuDefend, attackType) {
		let battle = battles.get(battleID);
		battle.fightqueue.push({
			waifuAttacking: waifuAttack,
			waifuDefending: waifuDefend,
			attackType: attackType,
		});
		battles.set(battleID, battle);
	}

	async executeAttackQueue(battleID, channelIDs) {
		let battle = battles.get(battleID);
		
		while (battle.fightqueue.length > 0 && battle.user1waifus.filter(x=>x.health).length && battle.user2waifus.filter(x=>x.health).length) {
			let attackObject = battle.fightqueue.shift();
			
			let attackingWaifu = findwaifu(battle, attackObject.waifuAttacking);
			let atkWaifuOwner = getwaifuOwner(battle, attackObject.waifuAttacking);
			let defendingWaifu = findwaifu(battle, attackObject.waifuDefending);
			let defWaifuOwner = getwaifuOwner(battle, attackObject.waifuDefending);
			//Init Attack
			let defAttackAbility = await defendingWaifu.defendStart(battle, attackObject, {
				attackingWaifu: attackingWaifu,
				defendingWaifu: defendingWaifu,
				atkWaifuOwner: atkWaifuOwner,
				defWaifuOwner: defWaifuOwner,
			});
			broadcastMessage(channelIDs, `${atkWaifuOwner.author.username}#${atkWaifuOwner.author.discriminator}'s ${attackingWaifu.name}
			attacks
			${defWaifuOwner.author.username}#${defWaifuOwner.author.discriminator}'s ${defendingWaifu.name}`);
			if (defAttackAbility && defAttackAbility.abilityUsed) {
				if (!defAttackAbility.silent) broadcastMessage(channelIDs, `${defendingWaifu.name} uses ${defAttackAbility.abilityUsed}`);
				if (defAttackAbility.attackCancelled) {
					broadcastMessage(channelIDs, "The attack got cancelled!");
				}
				if (defAttackAbility.customMSG) broadcastMessage(channelIDs, defAttackAbility.customMSG);
			}
			let atkAttackAbility = await attackingWaifu.attackStart(battle, attackObject, {
				attackingWaifu: attackingWaifu,
				defendingWaifu: defendingWaifu,
				atkWaifuOwner: atkWaifuOwner,
				defWaifuOwner: defWaifuOwner,
			});
			if (atkAttackAbility && atkAttackAbility.abilityUsed) {
				if (!atkAttackAbility.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} uses ${atkAttackAbility.abilityUsed}`);
				if (atkAttackAbility.attackCancelled) {
					broadcastMessage(channelIDs, "The attack got cancelled!");
				}
				if (atkAttackAbility.customMSG) broadcastMessage(channelIDs, atkAttackAbility.customMSG);
			}
			//Start Damage PreCalc
			let defDamageCalcAbility = await defendingWaifu.defendStartDamageCalc(battle, attackObject, {
				attackingWaifu: attackingWaifu,
				defendingWaifu: defendingWaifu,
				atkWaifuOwner: atkWaifuOwner,
				defWaifuOwner: defWaifuOwner,
			});
			if (defDamageCalcAbility && defDamageCalcAbility.abilityUsed) {
				if (!defDamageCalcAbility.silent) broadcastMessage(channelIDs, `${defendingWaifu.name} uses ${defDamageCalcAbility.abilityUsed}`);
				if (defDamageCalcAbility.customMSG) broadcastMessage(channelIDs, defDamageCalcAbility.customMSG);
			}
			let atkDamageCalcAbility = await attackingWaifu.attackPreCalcStart(battle, attackObject, {
				attackingWaifu: attackingWaifu,
				defendingWaifu: defendingWaifu,
				atkWaifuOwner: atkWaifuOwner,
				defWaifuOwner: defWaifuOwner,
			});
			if (atkDamageCalcAbility && atkDamageCalcAbility.abilityUsed) {
				if (!atkDamageCalcAbility.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} uses ${atkDamageCalcAbility.abilityUsed}`);
				if (atkDamageCalcAbility.customMSG) broadcastMessage(channelIDs, atkDamageCalcAbility.customMSG);
			}

			//End Damage Calc and go to damagePhase
			defendingWaifu.health -= attackObject.damage;
			let damageStep;
			let attackStep;
			if (defendingWaifu.health > 0) {
				broadcastMessage(channelIDs, `The attack dealt **${attackObject.damage}**! ${defendingWaifu.name} is now at **${defendingWaifu.health}**`);
				damageStep = await defendingWaifu.damaged(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				if (damageStep && damageStep.abilityUsed) {
					if (!damageStep.silent) broadcastMessage(channelIDs, `${defendingWaifu.name} activates ${damageStep.abilityUsed}`);
					if (damageStep.customMSG) broadcastMessage(channelIDs, damageStep.customMSG);
				}


				attackStep = await attackingWaifu.damages(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				if (attackStep && attackStep.abilityUsed) {
					if (!attackStep.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} activates ${attackStep.abilityUsed}`);
					if (attackStep.customMSG) broadcastMessage(channelIDs, attackStep.customMSG);
				}

			} else {
				
				damageStep = await defendingWaifu.death(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				if (damageStep && damageStep.abilityUsed) {
					if (!damageStep.silent) broadcastMessage(channelIDs, `${defendingWaifu.name} activates ${damageStep.abilityUsed}`);
					if (damageStep.skipDeath) continue;
					if (damageStep.customMSG) broadcastMessage(channelIDs, damageStep.customMSG);
				}


				attackStep = await attackingWaifu.kills(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				if (attackStep && attackStep.abilityUsed) {
					if (!attackStep.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} activates ${attackStep.abilityUsed}`);
					if (attackStep.skipDeath) continue;
					if (attackStep.customMSG) broadcastMessage(channelIDs, attackStep.customMSG);
				}
				broadcastMessage(channelIDs, `The attack dealt **${attackObject.damage}**! Killing ${defendingWaifu.name}!`);
				let atkEnd = await attackingWaifu.battleEnd(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				let defEnd = await defendingWaifu.battleEnd(battle, attackObject, {
					attackingWaifu: attackingWaifu,
					defendingWaifu: defendingWaifu,
					atkWaifuOwner: atkWaifuOwner,
					defWaifuOwner: defWaifuOwner,
				});
				if (atkEnd && atkEnd.abilityUsed) {
					if (!atkEnd.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} activates ${attackStep.abilityUsed}`);
					if (atkEnd.customMSG) broadcastMessage(channelIDs, atkEnd.customMSG);
				}
				if (defEnd && defEnd.abilityUsed) {
					if (!defEnd.silent) broadcastMessage(channelIDs, `${attackingWaifu.name} activates ${attackStep.abilityUsed}`);
					if (defEnd.customMSG) broadcastMessage(channelIDs, defEnd.customMSG);
				}
			}
			// let attackingWaifu = findwaifu(battle, attackObject.waifuAttacking);
			// let atkWaifuOwner = getwaifuOwner(battle, attackObject.waifuAttacking);
			// let defendingWaifu = findwaifu(battle, attackObject.waifuDefending);
			// let defWaifuOwner = getwaifuOwner(battle, attackObject.waifuDefending);
			if (atkWaifuOwner.id === battle.user1.id){
				for (let i = 0 ; i < battle.user1waifus.length;i++){
					if (battle.user1waifus[i].battleid === attackingWaifu.battleid ) {
						battle.user1waifus[i] = attackingWaifu; 
						break;
					}
				}
			}else{
				for (let i = 0 ; i < battle.user2waifus.length;i++){
					if (battle.user2waifus[i].battleid === attackingWaifu.battleid ) {
						battle.user2waifus[i] = attackingWaifu; 
						break;
					}
				}
			}
			if (defWaifuOwner.id === battle.user1.id){
				for (let i = 0 ; i < battle.user1waifus.length;i++){
					if (battle.user1waifus[i].battleid === defendingWaifu.battleid ) {
						battle.user1waifus[i] = defendingWaifu; 
						break;
					}
				}
			}else{
				for (let i = 0 ; i < battle.user2waifus.length;i++){
					if (battle.user2waifus[i].battleid === defendingWaifu.battleid ) {
						battle.user2waifus[i] = defendingWaifu; 
						break;
					}
				}
			}
		}
		battle.user1attacks = 0; 
		battle.user2attacks = 0;
		battle.turn ++; 
		battles.set(battleID,battle);
	}
}
module.exports = gameMaster;