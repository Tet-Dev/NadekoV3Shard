const { GuildCommand } = require("eris-boiler/lib");
const EmbedPaginator = require("eris-pagination");
module.exports = new GuildCommand({
	name: "queue", // name of command
	description: "Displays the current queue",
	run: (async (client, { msg, params }) => {
		let queue = await client.MusicHandler.getQueue(msg.guildID);
		let pagi = []
		if (queue.length > 10) {
			let queues = queue.chunk_inefficient(10);
			queues = queues.map(x => {
				return {
					"title": "Up Next",
					description: "",
					"fields": x
				};
			});
			const paginatedEmbed = await EmbedPaginator.createPaginationEmbed(msg, queues);
			return;
		}
		let desc;
		if (queue.length == 0) desc = "**Nothing in the queue!**";
		client.createMessage(msg.channel.id, {
			"embed":
			{
				"title": "Up Next",
				description: desc,
				"fields": queue
			}

		});
	}),
	options: {
		aliases: ["q"]
	}
});