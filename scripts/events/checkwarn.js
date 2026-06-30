module.exports = {
	config: {
		name: "checkwarn",
	version: "1.4",
	author: "NTKhang + Camille Uchiha",
		category: "events"
	},

	langs: {
	vi: { ... },
	en: { ... },
	fr: {
			warn: "⚠️ Membre %1 déjà banni 3 fois\n- Nom: %1\n- UID: %2\n- Pour débannir: \"%3warn unban <uid>\"",
			needPermission: "❌ Le bot doit être admin pour kick"
	}
	},

	onStart: async ({ threadsData, message, event, api, client, getLang }) => {
		if (event.logMessageType == "log:subscribe")
			return async function () {
				const { threadID } = event;
				const { data } = await threadsData.get(event.threadID);
				const { warn: warnList } = data;
				if (!warnList)
					return;
				const { addedParticipants } = event.logMessageData;
				for (const user of addedParticipants) {
					const findUser = warnList.find(w => w.userID == user.userFbId); // FIX ICI
					if (findUser && findUser.list >= 3) {
						const userName = user.fullName;
						const uid = user.userFbId;
						message.send({
							body: getLang("warn", userName, uid, client.getPrefix(threadID)),
							mentions: [{
								tag: userName,
								id: uid
							}]
						}, function () {
							api.removeUserFromGroup(uid, threadID, (err) => {
								if (err)
									return message.send(getLang("needPermission"));
							});
						});
					}
				}
			};
	}
};
