//BASE WAIFU

const e = require("express");
const Waifu = require("./BaseWaifu");
// const NLH = require
// defendStart,
// attackStart,
// defendStartDamageCalc,
// attackPreCalcStart,
// damaged,
// damages,
// death,
// kills,
// battleEnd
class DazaiOsamu extends Waifu {

	constructor(level,exp,owner,forShow){
		super("Dazai Osamu",100,25,{

			description: "The first waifu/husbando you get! With his ability **No Longer Human**, when Dazai gets attacked, the attacker's abilites are negated for the battle!"
		});
		this.defendStart = async (battle,attackObj,involved) =>{
			attackObj.attackingWaifu.canUseAbilities = false;
			return {
				abilityUsed: "**No Longer Human**",
				customMSG: "Battle abilities from the opponent's attacker will no longer activate for this battle!",
			};
		};
		this.battleEnd = async (battle,attackObj,involved) =>{
			attackObj.attackingWaifu.canUseAbilities = true;
			return {
				abilityUsed: "**No Longer Human**",
				silent: true,
				customMSG: "**No Longer Human** has worn off!",
			};
		};
		// Object.assign(this,attributes);
	}

}
module.exports = DazaiOsamu;