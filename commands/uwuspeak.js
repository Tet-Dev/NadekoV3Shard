const { GuildCommand } = require("eris-boiler/lib");
module.exports = new GuildCommand({
	name: "uwuspeak", // name of command
	description: "UwUifies a channel",
	run: (async (client, { msg, params }) => {
		if (await client.permissionsHandler.checkForPerm(msg.member,"uwuspeak")){
			let chan = (await client.SQLHandler.getChannel(msg.channel.id));
			if (chan.uwuspeak) {
				await client.SQLHandler.updateChannel(msg.channel.id,{uwuspeak:0});
				return "UwUSpeak now `OFF` !";
			}else{
				await client.SQLHandler.updateChannel(msg.channel.id,{uwuspeak:1});
				return "UwUSpeak now `ON` !";
			}
			
			
		}
		return "You lack the Permission Node ```uwuspeak```";
	}),
	options: {
		aliases: ["us"],
		optionalParameters: [],
		parameters: [],
	}
});