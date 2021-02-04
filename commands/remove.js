const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "remove", // name of command
	description: "Removes a song based on the index or \"all\" to purge the queue",
	run: (async (client, { msg, params }) => {
		if (params[0].toLowerCase() !== "all" && (isNaN(parseInt(params[0]))  || parseInt(params[0]) <= 0)){
			return "Invalid index!";
		}
		let resp = await client.MusicHandler.removeQueue(msg.guildID,params[0]);
		if (params[0].toLowerCase() === "all"){
			client.createMessage(msg.channel.id,"Removed all items from queue.");
		}else{
			msg.channel.createMessage("Removed `"+resp+ "` from the queue");
		}
	}),
	options:{
		// aliases: ["q"]
		parameters: ["The index of the item or \"all\" to purge the queue"]
	}
});