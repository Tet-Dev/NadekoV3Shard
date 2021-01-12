const { Command } = require("eris-boiler/lib");

module.exports = new Command({
	name: "pfp",
	description: "Displays pfp",
	options:{
		optionalParameters: ["Mention another user to get their pfp!"]
	},
	run: async (bot, {msg}) => {
		
		if (!msg.mentions.length) {
			msg.mentions = [msg.member.user];
		}

		var link = "";
		if (msg.mentions[0].avatarURL.includes(".gif")) {
			link = await msg.mentions[0].dynamicAvatarURL("gif", 1024);
	
		} else {
			link = await msg.mentions[0].dynamicAvatarURL("png", 1024);
		}
	
		return ( {
			embed: {
				title: "Profile Picture of " + msg.mentions[0].username,
				image: {
					url: link
				},
				description: " ",
	
				author: {
					name: msg.author.username,
					icon_url: msg.author.avatarURL,
				},
			},
		});
	}

});
