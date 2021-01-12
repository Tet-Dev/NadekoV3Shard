const { GuildCommand } = require("eris-boiler/lib");
function SecsToFormat(string) {
	var sec_num = parseInt(string, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;

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
module.exports = new GuildCommand({
	name: "nowplaying", // name of command
	description: "Displays whats playing right now! SLASH COMMAND WILL NOT WORK WITH THIS!",
	run: (async (client, { msg, params }) => {
	}),
	options: {
		aliases: ["np"]
	}
});