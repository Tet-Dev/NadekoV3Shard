let base = {
	dj: ["skipSong", "forceDC"],
	mod: ["purgeMessages", "mute", "nickLock", "nickLockClear", "unmute", "uwuspeak", "warnUser", "removeWarn","export"],
	extraRole: [],
	extraRole2: [],
	everyone: ["playSong", "viewWarns","pvc","nhentai","urban","lewd","notlewd","loop","viewCurve","snipe","flushify"]
};
let allPerms = ["skipSong","purgeMessages","mute","uwuspeak","disablecmd","nickLock","nickLockClear","reactionRoleCreate","reactionRoleRemove","warnUser","removeWarn","createRedditSub","clearRedditSub","unmute","viewWarns","forceDC","playSong","pvc","nhentai","urban","lewd","notlewd","loop","viewCurve","snipe","ripEmote","flushify","export"];
let bot;
class PermissionsHandler {

	constructor(sqlHandler,b) {
		bot = b;
		this.sqlHandler = sqlHandler;
		this.allPerms = allPerms;
	}
	async checkForPerm(mem, permName) {
		if (!mem.guild.name) mem.guild = await bot.getRESTGuild(mem.guild.id);
		mem = await bot.getRESTGuildMember(mem.guild.id,mem.id);
		if ((mem.permissions || mem.permission).has("administrator")) return true;

		let data =await this.sqlHandler.getGuild(mem.guild.id);
		if (!data) return false;
		if (data.adminRole && mem.roles.filter(x => x === data.adminRole).length == 1) return true;
		let hasRole = "everyone";
		if (data.djRole && mem.roles.filter(x => x === data.adminRole).length == 1) hasRole = "dj";
		if (data.extraRole && mem.roles.filter(x => x === data.adminRole).length == 1) hasRole = "extraRole2";
		if (data.modRole && mem.roles.filter(x => x === data.adminRole).length == 1) hasRole = "mod";
		if (data.extraRole2 && mem.roles.filter(x => x === data.adminRole).length == 1) hasRole = "extraRole2";
		let inherits = {
			everyone: (data.everyonePerms ? data.everyonePerms.split(",") : base.everyone).includes(permName),
			dj: (data.djRolePerms ? data.djRolePerms.split(",") : base.dj).includes(permName),
			extraRole: (data.extraRolePerms ? data.extraRolePerms.split(",") : base.extraRole).includes(permName),
			modRole: (data.modRolePerms ? data.modRolePerms.split(",") : base.mod).includes(permName),
			extraRole2: (data.extraRole2Perms ? data.extraRole2Perms.split(",") : base.extraRole2).includes(permName),
		};

		switch (hasRole) {
		case "dj":

			return inherits.dj || inherits.everyone;
		case "extraRole":
			return inherits.extraRole || inherits.dj || inherits.everyone;

		case "modRole":
			return inherits.modRole || inherits.extraRole || inherits.dj || inherits.everyone;

		case "extraRole2":
			return inherits.extraRole2 || inherits.modRole || inherits.extraRole || inherits.dj || inherits.everyone;

		default:
			return inherits.everyone;

		}

	}
	async getPermissions(guildid, roleName) {
		let data = await this.sqlHandler.getGuild(guildid);
		if (!data) return;
		let item = {
			everyone: (data.everyonePerms ? data.everyonePerms.split(",") : base.everyone),
			djRole: (data.djRolePerms ? data.djRolePerms.split(",") : base.dj),
			extraRole: (data.extraRolePerms ? data.extraRolePerms.split(",") : base.extraRole),
			modRole: (data.modRolePerms ? data.modRolePerms.split(",") : base.mod),
			extraRole2: (data.extraRole2Perms ? data.extraRole2Perms.split(",") : base.extraRole2),
		};
		return item[roleName];
	}
	getallPerms(){
		return allPerms;
	}
}
module.exports = PermissionsHandler;