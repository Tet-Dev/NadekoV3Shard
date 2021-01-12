const { GuildCommand } = require("eris-boiler/lib");
const jimp = require("jimp");
const fs = require("fs");
const requestAPI = require("request");
const emojiList = [
	{
		name: "grinning",
		char: "😀",
		base: "default",
		eyes: "default",
		mouth: "grinning",
		detail: "default",
	},
	{
		name: "grinning-big-eyes",
		char: "😃",
		base: "default",
		eyes: "big",
		mouth: "grinning",
		detail: "default",
	},
	{
		name: "grinning-closed-eyes",
		char: "😄",
		base: "default",
		eyes: "closed-happy",
		mouth: "grinning",
		detail: "default",
	},
	{
		name: "beaming-closed-eyes",
		char: "😁",
		base: "default",
		eyes: "closed-happy2",
		mouth: "beaming",
		detail: "default",
	},
	{
		name: "grinning-squinting-eyes",
		char: "😆",
		base: "default",
		eyes: "squinting",
		mouth: "grinning",
		detail: "default",
	},
	{
		name: "grinning-sweat",
		char: "😅",
		base: "default",
		eyes: "closed-happy",
		mouth: "grinning",
		detail: "sweat-drop",
	},
	{
		name: "tears-of-joy",
		char: "😂",
		base: "default",
		eyes: "laughing",
		mouth: "grinning",
		detail: "tears",
	},
	{
		name: "slight-smile",
		char: "🙂",
		base: "default",
		eyes: "default",
		mouth: "slight-smile",
		detail: "default",
	},
	{
		name: "winking",
		char: "😉",
		base: "default",
		eyes: "wink",
		mouth: "smile",
		detail: "default",
	},
	{
		name: "blushing",
		char: "😊",
		base: "default",
		eyes: "closed-happy3",
		mouth: "blushing",
		detail: "default",
	},
	{
		name: "smile-halo",
		char: "😇",
		base: "default",
		eyes: "closed-happy2",
		mouth: "smile-big",
		detail: "halo",
	},
	{
		name: "smiling-three-hearts",
		char: "🥰",
		base: "default",
		eyes: "closed-happy2",
		mouth: "smile-big",
		detail: "three-hearts",
	},
	{
		name: "hearts-eyes",
		char: "😍",
		base: "default",
		eyes: "hearts",
		mouth: "smile-open",
		detail: "default",
	},
	{
		name: "stars-eyes",
		char: "🤩",
		base: "default",
		eyes: "stars",
		mouth: "grinning",
		detail: "default",
	},
	{
		name: "kissing-heart",
		char: "😘",
		base: "default",
		eyes: "wink",
		mouth: "kiss-heart",
		detail: "default",
	},
	{
		name: "kissing",
		char: "😗",
		base: "default",
		eyes: "default",
		mouth: "kiss",
		detail: "default",
	},
	{
		name: "smiling",
		char: "☺️",
		base: "blushing",
		eyes: "closed-happy4",
		mouth: "smile",
		detail: "default",
	},
	{
		name: "kissing-blushing",
		char: "😚",
		base: "blushing",
		eyes: "closed-happy5",
		mouth: "kiss",
		detail: "default",
	},
	{
		name: "kissing-closed-eyes",
		char: "😙",
		base: "default",
		eyes: "closed-happy2",
		mouth: "kiss",
		detail: "default",
	},
	{
		name: "licking-lips",
		char: "😋",
		base: "default",
		eyes: "closed-happy3bis",
		mouth: "licking-lips",
		detail: "default",
	},
	{
		name: "tongue",
		char: "😛",
		base: "default",
		eyes: "default",
		mouth: "tongue",
		detail: "default",
	},
	{
		name: "winking-tongue",
		char: "😜",
		base: "default",
		eyes: "wink-big",
		mouth: "tongue",
		detail: "default",
	},
	{
		name: "crazy",
		char: "🤪",
		base: "default",
		eyes: "crazy",
		mouth: "crazy",
		detail: "default",
	},
	{
		name: "squinting-tongue",
		char: "😝",
		base: "default",
		eyes: "squinting",
		mouth: "tongue",
		detail: "default",
	},
	{
		name: "money-lover",
		char: "🤑",
		base: "default",
		eyes: "money",
		mouth: "money",
		detail: "default",
	},
	{
		name: "hugging",
		char: "🤗",
		base: "smaller",
		eyes: "closed-happy1bis",
		mouth: "smile-big1bis",
		detail: "hands",
	},
	{
		name: "hand-over-mouth",
		char: "🤭",
		base: "smaller",
		eyes: "closed-happy1ter",
		mouth: "void",
		detail: "hand",
	},
	{
		name: "shushing",
		char: "🤫",
		base: "smaller",
		eyes: "eyebrows",
		mouth: "open",
		detail: "shush",
	},
	{
		name: "thinking",
		char: "🤔",
		base: "smaller",
		eyes: "raised-eyebrow2",
		mouth: "unsure",
		detail: "thinking",
	},
	{
		name: "zipper-mouth",
		char: "🤐",
		base: "default",
		eyes: "default",
		mouth: "zipper",
		detail: "default",
	},
	{
		name: "raised-eyebrow",
		char: "🤨",
		base: "default",
		eyes: "raised-eyebrow",
		mouth: "straight",
		detail: "default",
	},
	{
		name: "neutral",
		char: "😐",
		base: "default",
		eyes: "default",
		mouth: "straight",
		detail: "default",
	},
	{
		name: "expressionless",
		char: "😑",
		base: "default",
		eyes: "straight",
		mouth: "straight",
		detail: "default",
	},
	{
		name: "mouthless",
		char: "😶",
		base: "default",
		eyes: "default",
		mouth: "void",
		detail: "default",
	},
	{
		name: "smirk",
		char: "😏",
		base: "default",
		eyes: "to-the-right",
		mouth: "smirk",
		detail: "default",
	},
	{
		name: "unamused",
		char: "😒",
		base: "default",
		eyes: "unamused",
		mouth: "frown",
		detail: "default",
	},
	{
		name: "rolling-eyes",
		char: "🙄",
		base: "default",
		eyes: "rolling",
		mouth: "awkward",
		detail: "default",
	},
	{
		name: "grimacing",
		char: "😬",
		base: "default",
		eyes: "default",
		mouth: "cringe",
		detail: "default",
	},
	{
		name: "lying",
		char: "🤥",
		base: "lying",
		eyes: "default",
		mouth: "awkward2",
		detail: "lying",
	},
	{
		name: "relieved",
		char: "😌",
		base: "default",
		eyes: "closed2",
		mouth: "smile",
		detail: "default",
	},
	{
		name: "pensive",
		char: "😔",
		base: "default",
		eyes: "closed3",
		mouth: "straight-small",
		detail: "default",
	},
	{
		name: "sleepy",
		char: "😪",
		base: "default",
		eyes: "sleeping",
		mouth: "scowl",
		detail: "snot-bubble",
	},
	{
		name: "drooling",
		char: "🤤",
		base: "default",
		eyes: "closed-happy6",
		mouth: "smirk2",
		detail: "drool",
	},
	{
		name: "sleeping",
		char: "😴",
		base: "default",
		eyes: "closed",
		mouth: "open-large",
		detail: "zzz",
	},
	{
		name: "med-mask",
		char: "😷",
		base: "default",
		eyes: "tired",
		mouth: "medical-mask",
		detail: "default",
	},
	{
		name: "thermometer",
		char: "🤒",
		base: "default",
		eyes: "eyebrows-sad",
		mouth: "frown-small",
		detail: "thermometer",
	},
	{
		name: "head-hurt",
		char: "🤕",
		base: "default",
		eyes: "closed-happy",
		mouth: "scowl2",
		detail: "head-bandage",
	},
	{
		name: "nauseated",
		char: "🤢",
		base: "sick",
		eyes: "unwell",
		mouth: "about-to-throw-up",
		detail: "default",
	},
	{
		name: "vomiting",
		char: "🤮",
		base: "default",
		eyes: "squinting",
		mouth: "vomit",
		detail: "default",
	},
	{
		name: "sneezing",
		char: "🤧",
		base: "default",
		eyes: "squinting",
		mouth: "awkward3",
		detail: "tissue",
	},
	{
		name: "hot",
		char: "🥵",
		base: "hot",
		eyes: "eyebrows-sad-black",
		mouth: "exhausted-tongue",
		detail: "sweat-drops",
	},
	{
		name: "cold",
		char: "🥶",
		base: "cold",
		eyes: "eyebrows-sad-blue",
		mouth: "cringe-blue",
		detail: "icicles",
	},
	{
		name: "woozy",
		char: "🥴",
		base: "default",
		eyes: "woozy",
		mouth: "woozy",
		detail: "default",
	},
	{
		name: "dizzy",
		char: "😵",
		base: "default",
		eyes: "dizzy",
		mouth: "open-huge",
		detail: "default",
	},
	{
		name: "exploding",
		char: "🤯",
		base: "exploding",
		eyes: "defaultbis",
		mouth: "open-huge",
		detail: "default",
	},
	{
		name: "cowboy",
		char: "🤠",
		base: "cowboy",
		eyes: "default",
		mouth: "smile-big",
		detail: "default",
	},
	{
		name: "sunglasses",
		char: "😎",
		base: "default",
		eyes: "sunglasses",
		mouth: "smile-big",
		detail: "default",
	},
	{
		name: "monocle",
		char: "🧐",
		base: "default",
		eyes: "monocle",
		mouth: "frown-small2",
		detail: "default",
	},
	{
		name: "confused",
		char: "😕",
		base: "default",
		eyes: "default",
		mouth: "awkward2bis",
		detail: "default",
	},
	{
		name: "worried",
		char: "😟",
		base: "default",
		eyes: "eyebrows-sad",
		mouth: "scowl",
		detail: "default",
	},
	{
		name: "frowning",
		char: "☹️",
		base: "default",
		eyes: "default",
		mouth: "frown-big",
		detail: "default",
	},
	{
		name: "slightly-frowning",
		char: "🙁",
		base: "default",
		eyes: "default",
		mouth: "frown",
		detail: "default",
	},
	{
		name: "open-mouth",
		char: "😮",
		base: "default",
		eyes: "default",
		mouth: "open-huge",
		detail: "default",
	},
	{
		name: "surprised",
		char: "😯",
		base: "default",
		eyes: "eyebrowsbis",
		mouth: "open-big",
		detail: "default",
	},
	{
		name: "astonished",
		char: "😲",
		base: "default",
		eyes: "eyebrowsbis",
		mouth: "open-teeths",
		detail: "default",
	},
	{
		name: "flushed",
		char: "😳",
		base: "blushing",
		eyes: "wide-open",
		mouth: "straight-small",
		detail: "default",
	},
	{
		name: "pleading",
		char: "🥺",
		base: "default",
		eyes: "pleading",
		mouth: "frown-small2bis",
		detail: "default",
	},
	{
		name: "scowl",
		char: "😦",
		base: "default",
		eyes: "default",
		mouth: "scowl",
		detail: "default",
	},
	{
		name: "anguished",
		char: "😧",
		base: "default",
		eyes: "eyebrowsbis",
		mouth: "scowl",
		detail: "default",
	},
	{
		name: "fearful",
		char: "😨",
		base: "fear",
		eyes: "eyebrowsbis",
		mouth: "scowl",
		detail: "default",
	},
	{
		name: "anxious",
		char: "😰",
		base: "fear",
		eyes: "eyebrows-sad",
		mouth: "scowl",
		detail: "sweat-drop2",
	},
	{
		name: "sad-relieved",
		char: "😥",
		base: "default",
		eyes: "eyebrows-sad",
		mouth: "scowl",
		detail: "sweat-drop2",
	},
	{
		name: "crying",
		char: "😢",
		base: "default",
		eyes: "eyebrowsbis",
		mouth: "scowl",
		detail: "tear",
	},
	{
		name: "in-tears",
		char: "😭",
		base: "in-tears",
		eyes: "closed-sad",
		mouth: "open-tongue",
		detail: "default",
	},
	{
		name: "horrified",
		char: "😱",
		base: "fear",
		eyes: "dead",
		mouth: "open-enormous",
		detail: "hands-on-cheeks",
	},
	{
		name: "confounded",
		char: "😖",
		base: "default",
		eyes: "squinting-eyebrows",
		mouth: "zigzag",
		detail: "default",
	},
	{
		name: "persevering",
		char: "😣",
		base: "default",
		eyes: "squinting-slightly",
		mouth: "scowl3",
		detail: "default",
	},
	{
		name: "disappointed",
		char: "😞",
		base: "default",
		eyes: "closed-sad2",
		mouth: "frown",
		detail: "default",
	},
	{
		name: "cold-sweat",
		char: "😓",
		base: "default",
		eyes: "closed-happy1quater",
		mouth: "scowl2",
		detail: "sweat-drop3",
	},
	{
		name: "weary",
		char: "😩",
		base: "default",
		eyes: "weary",
		mouth: "frown-teeths",
		detail: "default",
	},
	{
		name: "tired",
		char: "😫",
		base: "default",
		eyes: "squinting-slightly2",
		mouth: "frown-teeths2",
		detail: "default",
	},
	{
		name: "steam-from-nose",
		char: "😤",
		base: "default",
		eyes: "pissed",
		mouth: "frown-big2",
		detail: "steam",
	},
	{
		name: "extremely-angry",
		char: "😡",
		base: "angry",
		eyes: "angry-black",
		mouth: "frown-black",
		detail: "default",
	},
	{
		name: "angry",
		char: "😠",
		base: "default",
		eyes: "angry",
		mouth: "frown",
		detail: "default",
	},
	{
		name: "cursing",
		char: "🤬",
		base: "angry",
		eyes: "angry-black",
		mouth: "curses",
		detail: "default",
	},
	{
		name: "demon-smiling",
		char: "😈",
		base: "demon",
		eyes: "angry-purple",
		mouth: "smile-big-purple",
		detail: "default",
	},
	{
		name: "demon-angry",
		char: "👿",
		base: "demon",
		eyes: "angry2-purple",
		mouth: "frown-purple",
		detail: "default",
	},
	{
		name: "poo",
		char: "💩",
		base: "poo",
		eyes: "poo",
		mouth: "poo",
		detail: "default",
	},
	{
		name: "clown",
		char: "🤡",
		base: "clown",
		eyes: "default",
		mouth: "clown",
		detail: "clown-makeup",
	},
	{
		name: "alien",
		char: "👽",
		base: "alien",
		eyes: "alien",
		mouth: "alien",
		detail: "default",
	},
	{
		name: "happy-cat",
		char: "😺",
		base: "cat",
		eyes: "default-black",
		mouth: "cat",
		detail: "cat-mustache",
	},
	{
		name: "grinning-cat",
		char: "😸",
		base: "cat",
		eyes: "closed-happy5-black",
		mouth: "cat",
		detail: "cat-mustache",
	},
	{
		name: "laughing-cat",
		char: "😹",
		base: "cat",
		eyes: "closed-happy5-black",
		mouth: "cat",
		detail: "cat-mustache-plus-tears",
	},
	{
		name: "heart-eyes-cat",
		char: "😻",
		base: "cat",
		eyes: "hearts",
		mouth: "cat",
		detail: "cat-mustache",
	},
	{
		name: "smirking-cat",
		char: "😼",
		base: "cat",
		eyes: "eyebrows2-black",
		mouth: "smirk-black",
		detail: "cat-mustache",
	},
	{
		name: "kissing-cat",
		char: "😽",
		base: "cat",
		eyes: "closed-happy5-black",
		mouth: "kiss-black",
		detail: "cat-mustache",
	},
	{
		name: "horrified-cat",
		char: "🙀",
		base: "cat",
		eyes: "dead",
		mouth: "open-enormous-black",
		detail: "cat-scared",
	},
	{
		name: "sad-cat",
		char: "😿",
		base: "cat",
		eyes: "eyebrows-sad2-black",
		mouth: "frown2-black",
		detail: "cat-mustache-plus-tear",
	},
	{
		name: "angry-cat",
		char: "😾",
		base: "cat",
		eyes: "angry3-black",
		mouth: "frown3-black",
		detail: "cat-mustache",
	},
	{
		name: "partying",
		char: "🥳",
		base: "party-hat",
		eyes: "closed-happy7",
		mouth: "party-horn",
		detail: "confettis",
	},
	{
		name: "new-moon",
		char: "🌚",
		base: "new-moon",
		eyes: "moon",
		mouth: "moon",
		detail: "default",
	},
	{
		name: "full-moon",
		char: "🌝",
		base: "full-moon",
		eyes: "moon",
		mouth: "moon",
		detail: "default",
	},
	{
		name: "sun",
		char: "🌞",
		base: "sun",
		eyes: "sun",
		mouth: "sun",
		detail: "default",
	},
	{
		name: "upside-down",
		char: "🙃",
		base: "default",
		eyes: "default",
		mouth: "slight-smile",
		detail: "default",
	},
	{
		name: "ROFL",
		char: "🤣",
		base: "default",
		eyes: "squinting",
		mouth: "grinning-big",
		detail: "tears3",
	},
	{
		name: "skull",
		char: "💀",
		base: "skull",
		eyes: "holes",
		mouth: "void",
		detail: "default",
	},
	{
		name: "baby",
		char: "👶",
		base: "baby",
		eyes: "baby",
		mouth: "baby",
		detail: "default",
	},
	{
		name: "ogre",
		char: "👹",
		base: "ogre",
		eyes: "ogre",
		mouth: "ogre",
		detail: "horns",
	},
];

function getEmojiBasedOnChar(e) {
	for (let i = 0; i < emojiList.length; i++) {
		if (emojiList[i]["char"] == e) {
			return emojiList[i];
		}
	}

	return -1;
}
const fsp = require("fs").promises;
function download(url, path) {
	return new Promise((reso, rej) => {
		requestAPI.head(url, (err, res, body) => {
			requestAPI(url)
				.pipe(fs.createWriteStream(path))
				.on("close", () => { reso(path); });
		});
	});
}
function genID(length) {
	let result = "";
	let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

module.exports = new GuildCommand({
	name: "flushify", // name of command
	description: "Makes any emote flushed! (In partnership with `ᚣᛇᚱᚣ#9670`)",
	run: (async (client, { msg, params }) => {
		if (!(await client.permissionsHandler.checkForPerm(msg.member, "flushify"))) {
			return "You lack the permission `flushify`";
		}
		let regEmote = msg.content.match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/);
		if (regEmote) {
			regEmote = regEmote[0];
			let emoji = emojiList.filter(x => x.char === regEmote)[0];

			if (!emoji)
				return "Emoji not found!";


			let images = ["./data/emojis/base/" + emoji["base"] + ".png", "./data/emojis/eyes/wide-open.png", "./data/emojis/mouth/" + emoji["mouth"] + ".png", "./data/emojis/detail/" + emoji["detail"] + ".png"];

			if (emoji["name"] == "ROFL") {
				images[1] = "./data/emojis/eyes/squinting.png";
				images[2] = "./data/emojis/mouth/straight-small.png";
			} else if (emoji["name"] == "cowboy") {
				images[2] = "./data/emojis/mouth/straight-small.png";
			}

			let jimps = [];

			for (var i = 0; i < images.length; i++) {
				jimps.push(jimp.read(images[i]));
			}

			let detaily = 0;
			let detailx = 0;
			let eyex = 0;
			let eyey = 0;
			let mouthx = 0;
			let mouthy = 0;

			let data = await Promise.all(jimps);
			if (emoji["base"] == "cowboy") {
				detaily = 50;
				eyey = 200;
				eyex = 50;
				eyey = 100;
				mouthx = 30;
				mouthy = 100
				data[1].resize(300, 300);
			} else if (emoji["name"] == "ROFL") {
				detailx = -5;
				data[0].rotate(45)
				data[1].rotate(45)
				data[2].rotate(45)
				data[3].rotate(45)
			}
			data[0].composite(data[1], eyex, eyey);
			data[0].composite(data[2], mouthx, mouthy);
			data[0].composite(data[3], detailx, detaily);


			if (emoji["name"] == "upside-down"){
				data[0].rotate(180);
			}
			//Write or something to file
			let filedir2 = `./temp/${genID(20)}.png`;
			await data[0].writeAsync(filedir2);
			await msg.channel.createMessage("Flushified!", {
				file: await fsp.readFile(filedir2),
				name: "DazaiFlushify.png"
			});
			fsp.unlink(filedir2);
			//idk whatever someone wants to do here

			return;
		}
		let ripemot = msg.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g) ? "https://cdn.discordapp.com/emojis/" + msg.content.match(/((<a)|(<))((@!?\d+)|(:.+?:\d+))>/g)[0].match(/\d+/)[0] + ".png" : null;
		ripemot = (msg.attachments.length) ? msg.attachments[0].url : ripemot;
		if (!ripemot) {
			return "No file attached or emote mentioned!";
		}
		let filedir = `./temp/${genID(20)}.png`;
		let file = await jimp.read(await download(ripemot, filedir));
		let flushTemplate = await jimp.read("./assets/jimpStuff/flushedtemplate.png");
		flushTemplate.resize(file.bitmap.width, file.bitmap.height);
		file.composite(flushTemplate, 0, 0);
		let filedir2 = `./temp/${genID(20)}.png`;
		await file.writeAsync(filedir2);
		await msg.channel.createMessage("Flushified!", {
			file: await fsp.readFile(filedir2),
			name: "DazaiFlushify.png"
		});
		fsp.unlink(filedir2);
		fsp.unlink(filedir);
		return;

	}),
	options: {
		optionalParameters: ["Either attach an image to your message or mention a emote, flushify will not flushify gifs."]
	} // functionality of command
	// list of things in object passed to run: bot (DataClient), msg (Message), params (String[])
});