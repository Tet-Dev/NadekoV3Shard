const { Command } = require("eris-boiler/lib");


module.exports = new Command({
	name: "botstats",
	description: "Check Bot stats",
	options: {
		aliases:["bs","bstats"],
	},
	run: async (bot) => {
		const seconds = process.uptime();
		const uptime = getDuration(seconds);

		const memory = Math.round(
			(process.memoryUsage().heapUsed / 1024 / 1024) * 100
		) / 100;

		const inline = true;
		const embed = {
			description: ":heartbeat: [**Bot Stats**](https://dazai.app)",
			thumbnail: { url: bot.user.avatarURL },
			timestamp: require("dateformat")(Date.now(), "isoDateTime"),
			color: 0x3498db,
			fields: [
				{ name: "Uptime", value: uptime, inline },
				{ name: "Memory Used", value: `${memory}MB`, inline },
				{ name: "Guilds", value: bot.guilds.size, inline }
			]
		};
		return { embed };
	}
});

function getDuration (seconds) {
	const times = [ 31557600, 86400, 3600, 60 ];
	return times.reduce((ax, dx, cx) => {
		const quotient = Math.floor(ax.seconds / dx);
		ax.seconds = Math.floor(ax.seconds % dx);
		let str = "";
		if (quotient > 0) {
			str += quotient;
			if (str.length < 2 && cx > 0) {
				str = "0" + str;
			}
		} else if (ax.time[0]) {
			str = "00";
		}
		if (str) {
			ax.time.push(str);
		}
		if (times.length - 1 === cx) {
			if (ax.seconds < 10) {
				ax.seconds = "0" + ax.seconds;
			}
			ax.time.push("" + ax.seconds);
			return ax.time.join(":");
		}
		return ax;
	}, { time: [], seconds });
}
