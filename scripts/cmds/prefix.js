const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
	version: "1.5",
		author: "NTKhang & Christus",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
		role: 0,
		description: "Changer le préfixe du bot dans ton groupe ou pour tout le bot (admin bot seulement)",
		category: "config",
	guide: {
			vi: " {pn} <new prefix>: thay đổi prefix mới trong box chat của bạn"
				+ "\n Ví dụ:"
				+ "\n {pn} #"
				+ "\n\n {pn} <new prefix> -g: thay đổi prefix mới trong hệ thống bot (chỉ admin bot)"
				+ "\n Ví dụ:"
				+ "\n {pn} # -g"
				+ "\n\n {pn} reset: thay đổi prefix trong box chat của bạn về mặc định",
			en: " {pn} <new prefix>: change new prefix in your box chat"
				+ "\n Example:"
				+ "\n {pn} #"
				+ "\n\n {pn} <new prefix> -g: change new prefix in system bot (only admin bot)"
				+ "\n Example:"
				+ "\n {pn} # -g"
				+ "\n\n {pn} reset: change prefix in your box chat to default",
			fr: " {pn} <nouveau prefix>: changer le prefix dans ton groupe"
				+ "\n Exemple:"
				+ "\n {pn} #"
				+ "\n\n {pn} <nouveau prefix> -g: changer le prefix du bot entier (admin bot seulement)"
				+ "\n Exemple:"
				+ "\n {pn} # -g"
				+ "\n\n {pn} reset: remettre le prefix par défaut dans ton groupe"
	}
	},

	langs: {
	vi: {
			reset: "Đã reset prefix của bạn về mặc định: %1",
			onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
			confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
			confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
			successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
			successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1",
			myPrefix: "👋 Hey %1, did you ask for my prefix?\n➥ 🌐 Global: %2\n➥ 💬 This Chat: %3\nI'm %4 at your service 🫡"
		},
		en: {
			reset: "Your prefix reset to default: %1",
			onlyAdmin: "Only admin can change prefix of system bot",
			confirmGlobal: "Please react to this message to confirm change prefix of system bot",
			confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
			successGlobal: "Changed prefix of system bot to: %1",
			successThisThread: "Changed prefix in your box chat to: %1",
			myPrefix: "👋 Hey %1, did you ask for my prefix?\n➥ 🌐 Global: %2\n➥ 💬 This Chat: %3\nI'm %4 at your service 🫡"
	},
	fr: {
			reset: `🍓━━━━━━━━🍓\n✅ 𝗥𝗘𝗜𝗡𝗜𝗧𝗜𝗔𝗟𝗜𝗦𝗘\nLe prefix a été remis par défaut: %1\n🍓━━━━━━━━🍓`,
			onlyAdmin: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗥𝗘𝗨𝗥\n\nSeul l'admin du bot peut changer le prefix global\n🍓━━━━━━━━🍓`,
			confirmGlobal: `🍓━━━━━━━━🍓\n⚠️ 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n\nRéagis à ce message pour confirmer le changement du prefix GLOBAL du bot en: %1\n🍓━━━━━━━━🍓`,
			confirmThisThread: `🍓━━━━━━━━🍓\n⚠️ 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗧𝗜𝗢𝗡\n\nRéagis à ce message pour confirmer le changement du prefix dans ce groupe en: %1\n🍓━━━━━━━━🍓`,
			successGlobal: `🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗖𝗘̀𝗦\nPrefix global changé en: %1\n🍓━━━━━━━━🍓`,
			successThisThread: `🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗖𝗘̀𝗦\nPrefix de ce groupe changé en: %1\n🍓━━━━━━━━🍓`,
			myPrefix: `🍓━━━━━━━━🍓\n👋 𝗦𝗔𝗟𝗨𝗧 %1\n\n➥ 🌐 𝗚𝗹𝗼𝗯𝗮𝗹: %2\n➥ 💬 𝗜𝗰𝗶: %3\n\nJe suis %4 à ton service 🫡\n🍓━━━━━━━━🍓`
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] == 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g")
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g"? getLang("confirmGlobal", newPrefix) : getLang("confirmThisThread", newPrefix), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID!== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		}
		else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang, usersData }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return async () => {
				const userName = await usersData.getName(event.senderID);
				const botName = global.GoatBot.config.nickNameBot || "Bot";
				return message.reply(getLang("myPrefix", userName, global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName));
			};
	}
};
