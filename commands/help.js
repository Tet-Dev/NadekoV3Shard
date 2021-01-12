const { Command } = require("eris-boiler/lib");

module.exports = new Command({
	name: "help",
	description: "Displays this message, duh!",
	run: async (bot, context) => {
		const {
			params
		} = context;

		if (params[0]) {
			return commandInfo(bot, params[0]);
		}

		// const { commands, longName } = await filterCommands(bot, context);

		// const content = commands.reduce(
		//   (ax, { name, description, aliases }) => ax + `\n${name}` + (
		//     aliases.length > 0 ? '/' + aliases.join('/') : ''
		//   ) + ':' + ' '.repeat(longName - name.length) + description,
		//   'Available commands:```'
		// ) + '\n```\nTo get more information try: `help command`'
		const content = "Check https://dazai.app/commands for the current list of commands! \nTo get more information try: `help command`\nNeed to report a bug?||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|  discord.gg/jvqdyW8";
		return {
			dm: false,
			content
		};
	}
});

async function filterCommands (bot, context) {
	const commands = [];
	let longName = 0;
	for (const command of bot.commands.values()) {
		let {
			name,
			aliases,
			description
		} = command;
		aliases = aliases || [" "];
		longName = Math.max(
			name.length + aliases.join("/").length + 3, longName
		);
		commands.push({ name, description, aliases });
	}

	return { commands, longName };
}

function commandInfo (bot, cmd) {
	const command = bot.findCommand(cmd);

	if (!command) {
		return `${cmd} is not a command or alias!`;
	}

	return {
		dm: true,
		content: "```" + command.info + "```"
	};
}
