const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
	version: "1.5",
	author: "NTKhang",
		editor: "Camille Uchiha 🍓",
		envConfig: {
			allow: true
	},
		category: "events"
	},

	langs: {
		vi: {
			title: "====== Nhật ký bot ======",
			added: "\n✅\nSự kiện: bot được thêm vào nhóm mới\n- Người thêm: %1",
			kicked: "\n❌\nSự kiện: bot bị kick\n- Người kick: %1",
			footer: "\n- User ID: %1\n- Nhóm: %2\n- ID nhóm: %3\n- Thời gian: %4"
	},
	en: {
			title: "====== Bot logs ======",
			added: "\n✅\nEvent: bot has been added to a new group\n- Added by: %1",
			kicked: "\n❌\nEvent: bot has been kicked\n- Kicked by: %1",
			footer: "\n- User ID: %1\n- Group: %2\n- Group ID: %3\n- Time: %4"
		},
		fr: {
			title: `🍓━━━━━━━━🍓\n📋 𝗝𝗢𝗨𝗥𝗡𝗔𝗟 𝗗𝗨 𝗕𝗢𝗧\n🍓━━━━━━━━🍓`,
			added: `\n✅ 𝗘́𝗩𝗘́𝗡𝗘𝗠𝗘𝗡𝗧: Le bot a été ajouté dans un nouveau groupe\n- 𝗔𝗷𝗼𝘂𝘁𝗲́ 𝗽𝗮𝗿: %1`,
			kicked: `\n❌ 𝗘́𝗩𝗘́𝗡𝗘𝗠𝗘𝗡𝗧: Le bot a été expulsé\n- 𝗘𝘅𝗽𝘂𝗹𝘀𝗲́ 𝗽𝗮𝗿: %1`,
			footer: `\n━━━━━━━━━━━━━━━━\n👤 𝗨𝘀𝗲𝗿 𝗜𝗗: %1\n👥 𝗚𝗿𝗼𝘂𝗽𝗲: %2\n🆔 𝗜𝗗 𝗚𝗿𝗼𝘂𝗽𝗲: %3\n⏰ 𝗛𝗲𝘂𝗿𝗲: %4\n🍓━━━━━━━━🍓`
	}
	},

	onStart: async ({ usersData, threadsData, event, api, getLang }) => {
		if (
			(event.logMessageType == "log:subscribe" && event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
			|| (event.logMessageType == "log:unsubscribe" && event.logMessageData.leftParticipantFbId == api.getCurrentUserID())
		) return async function () {
			let msg = getLang("title");
			const { author, threadID } = event;
			if (author == api.getCurrentUserID())
				return;
			let threadName;
			const { config } = global.GoatBot;

			if (event.logMessageType == "log:subscribe") {
				if (!event.logMessageData.addedParticipants.some(item => item.userFbId == api.getCurrentUserID()))
					return;
				threadName = (await api.getThreadInfo(threadID)).threadName;
				const authorName = await usersData.getName(author);
				msg += getLang("added", authorName);
			}
			else if (event.logMessageType == "log:unsubscribe") {
				if (event.logMessageData.leftParticipantFbId != api.getCurrentUserID())
					return;
				const authorName = await usersData.getName(author);
				const threadData = await threadsData.get(threadID);
				threadName = threadData.threadName;
				msg += getLang("kicked", authorName);
			}
			const time = getTime("DD/MM/YYYY HH:mm:ss");
			msg += getLang("footer", author, threadName, threadID, time);

			for (const adminID of config.adminBot)
				api.sendMessage(msg, adminID);
	};
	}
};
