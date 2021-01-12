const mysql = require("mysql");
class SQLHandler {
	constructor() {
		this.guildDB = mysql.createPool({
			host: "sql.dazai.app",
			user: process.env.SQLUSER || "root",
			password: process.env.SQLPASSWORD,
			database: "nadekoguilddata",
			charset: "utf8mb4",
		});
		this.guildDB.on("error", function (err) {
			console.trace("db error", err);

			if (err.code === "PROTOCOL_CONNECTION_LOST") {
				this.handleDisconnect();
			} else {

				throw err;
			}
		});
	}
	clean(str) {
		return str.replace(/[";`']/g, m => "\\" + m);

	}
	handleDisconnect() {
		(() => {
			this.guildDB = mysql.createPool({
				host: "sql.dazai.app",
				user:  process.env.SQLUSER || "root",
				password: process.env.SQLPASSWORD,
				database: "nadekoguilddata",
				charset: "utf8mb4",
			});
		})();

	}
	query(str) {
		return new Promise((resolve, reject) => {
			if (!this || !this.guildDB) {
				reject("Object not Initiated");
			} else {
				this.guildDB.query(str, function (err, res) {
					(err ? reject(err) : resolve(res));
				});
			}
		});
	}
	async getGuild(guildID,getinArr) {
		let data = await this.query("SELECT * FROM nadekoguilddata.guilddata WHERE id = \"" + this.clean(guildID) + "\"");
		if (!data || !data.length) {
			await this.query("INSERT INTO `nadekoguilddata`.`guilddata` (`id`) VALUES ('" + guildID + "')");
			data = await this.getGuild(guildID,true);
		}
		return (getinArr? data:data[0]);
	}
	async serverIsBeta(guildID){
		let data = await this.getGuild(guildID);
		return data.beta == 1;
	}
	async updateGuild(guildID, updateOBJ) {
		try {
			await this.getGuild(guildID);
			let adds = Object.keys(updateOBJ);
			adds = adds.map(x => "`" + x + "` = '" + updateOBJ[x] + "'");
			await this.query("UPDATE `nadekoguilddata`.`guilddata` SET " + adds.join(", ") + " WHERE (`id` = '" + this.clean(guildID) + "')");
			return true;
		} catch (error) {
			return false;
		}

	}
	async getPunishments(guildid,getInArr){
		let data = await this.query("SELECT * FROM nadekoguilddata.guildpunishments WHERE (guildid = '"+guildid+"')");
		if (!data || data.length == 0){
			await this.query("INSERT INTO nadekoguilddata.guildpunishments (guildid) VALUES ('"+guildid+"')");
			data = await this.getPunishments(guildid,true);
		}
		return (getInArr? data:data[0]);
	}
	async updatePunishments(guildid,updateOBJ){
		try {
			await this.getPunishments(guildid);
			let adds = Object.keys(updateOBJ);
			adds = adds.map(x => "`" + x + "` = '" + updateOBJ[x] + "'");
			await this.query("UPDATE `nadekoguilddata`.`guildpunishments` SET " + adds.join(", ") + " WHERE (`guildid` = '" + this.clean(guildid) + "')");
			return true;
		} catch (error) {
			console.trace(error);
			return false;
		}
	}
	async getChannel(channelID,getinArr){
		let data = await this.query("SELECT * FROM nadekoguilddata.channeldata WHERE channelID = \""+this.clean(channelID)+"\"");
		if (!data || !data.length){
			await this.query("INSERT INTO `nadekoguilddata`.`channeldata` (`channelID`) VALUES ('" + this.clean(channelID) + "')");
			data = await this.getChannel(channelID,true);
		}
		return (getinArr? data:data[0]);
	}
	async updateChannel(channelID,updateOBJ){
		try {
			await this.getChannel(channelID);
			let adds = Object.keys(updateOBJ);
			adds = adds.map(x => "`" + x + "` = '" + updateOBJ[x] + "'");
			
			await this.query("UPDATE `nadekoguilddata`.`channeldata` SET " + adds.join(", ") + " WHERE (`channelID` = '" + this.clean(channelID) + "')");
			return true;
		} catch (error) {
			console.trace(error);
			return false;
		}
	}
	async genericGet(db,keyname,keyval,disableCreateIfNull,dirty,getInArr){

		let data = await this.query(`SELECT * FROM nadekoguilddata.${db} WHERE ${dirty?keyname:this.clean(keyname)} = "${dirty?keyval:this.clean(keyval)}"`);
		if (!data || !data.length){
			await this.genericSet(db,keyname,keyval);
			data = await this.query(`SELECT * FROM nadekoguilddata.${db} WHERE ${dirty?keyname:this.clean(keyname)} = "${dirty?keyval:this.clean(keyval)}"`);
		} 
		return getInArr? data:data[0];
	}
	async genericGetAll(db){

		let data = await this.query(`SELECT * FROM nadekoguilddata.${db}`);
		return data;
	}
	async genericSet(db,keyname,keyval,updateOBJ){
		try {
			let adds = updateOBJ? Object.keys(updateOBJ):[];
			let vals = updateOBJ? Object.values(updateOBJ):[];
			vals = vals.map(x=>this.clean(x+""));
			await this.query(`INSERT INTO \`nadekoguilddata\`.\`${db}\` (\`${keyname}\` ${adds.length?",`"+adds.join("`,`")+"`":""}) VALUES ('${keyval}'${vals.length? ",'"+vals.join("','")+"'":""})`);
		} catch (error) {
			console.trace(error);
			return false;
		}
	}
	async genericUpdate(db,keyname,keyval,updateOBJ){
		try {
			await this.genericGet(db,keyname,keyval);
			let adds = Object.keys(updateOBJ);
			adds = adds.map(x => "`" + x + "` = '" + updateOBJ[x] + "'");
			
			await this.query("UPDATE `nadekoguilddata`.`"+db+"` SET " + adds.join(", ") + " WHERE (`"+keyname+"` = '" + this.clean(keyval) + "')");
			return true;
		} catch (error) {
			console.trace(error);
			
			return false;
		}
	}
	async genericDelete(db,keyname,keyval,dirty){
		await this.query(`DELETE FROM \`nadekoguilddata\`.\`${db}\` WHERE (\`${dirty?keyname:this.clean(keyname)}\` = '${dirty?keyval:this.clean(keyval)}')`);
	}
	
	//UPDATE `nadekoguilddata`.`guilddata` SET `currentsonglink` = 'a', `queuecache` = 'b' WHERE (`id` = '776259872399949836');




}
module.exports = SQLHandler;