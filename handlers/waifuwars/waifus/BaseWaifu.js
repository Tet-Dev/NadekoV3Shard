//BASE WAIFU


class Waifu {

	constructor(name,health,damage,attributes){
		this.name = name;
		this.health = health;
		this.damage = damage;
		this.canAttack = true;
		this.canUseAbilities = true;
		Object.assign(this,attributes);
		this.defendStart = this.defendStart || (()=>{return null;});
		this.attackStart = this.attackStart || (()=>{return null;});
		this.defendStartDamageCalc = this.defendStartDamageCalc || (()=>{return null;});
		this.attackPreCalcStart = this.attackPreCalcStart || (()=>{return null;});
		this.damaged = this.damaged || (()=>{return null;});
		this.damages = this.damages || (()=>{return null;});
		this.death = this.death || (()=>{return null;});
		this.kills = this.kills || (()=>{return null;});
		this.battleEnd = this.battleEnd || (()=>{return null;});
	}

}
module.exports = Waifu;