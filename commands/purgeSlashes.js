const { GuildCommand } = require("eris-boiler/lib");
const fs = require("fs");
const axios = require("axios");
//------------------------------------------------ BASIC CONSTS
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
//------------------------------------------------
function text_truncate(str, len) {
	let array = str.split("");
	array.length = len - 3;
	return array.join("") + "...";
}
// const StreamToArray = require("stream-to-array");
// const rank = require("./rank");
module.exports = new GuildCommand({
	name: "refreshSlashCommands", // name of command
	description: "",
	run: (async (client, { msg, params }) => {
		if (client.botMasters.includes(msg.author.id) ){
			let allCommands = await axios.get(`https://discord.com/api/v8/applications/${client.user.id}/commands`, {
				headers: {
					Authorization: client.token
				}
			});
			allCommands = allCommands.data;
			let allIds = allCommands.map(x=>x.id);
			for (let i = 0 ; i < allIds.length; i++){
				await sleep(3000);
				let allCommands = await axios.delete(`https://discord.com/api/v8/applications/${client.user.id}/commands/${allIds[i]}`, {
					headers: {
						Authorization: client.token
					}
				}).catch(er=>console.trace(er));
				// applications/<my_application_id>/commands/<command_id>
			}
			await client.setupCommands();
			//
			return "Done!";
		}
		
	}),
	options: {
		hidden:true,
		// aliases: ["p"] 
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});