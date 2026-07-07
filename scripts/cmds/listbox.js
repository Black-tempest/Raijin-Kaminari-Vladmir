module.exports = {
	config: {
		name: "listbox",
	version: "1.1.0",
		author: "ArYAN",
		editor: "Camille Uchiha 🍓",
		role: 2,
		countDown: 10,
		shortDescription: {
			en: "List all groups bot is in",
			fr: "Lister tous les groupes où le bot est présent"
	},
		longDescription: {
			en: "Shows all group names and their thread IDs where the bot is a member.",
			fr: "Affiche tous les noms de groupes et leurs ID où le bot est membre."
		},
		category: "system",
		guide: {
			en: "{pn}",
			fr: "{pn}"
	},
	},

	onStart: async function ({ api, event }) {
		try {
			const threads = await api.getThreadList(100, null, ["INBOX"]);
			const groupThreads = threads.filter(
				(t) => t.isGroup && t.name && t.threadID
			);

			if (groupThreads.length === 0) {
				return api.sendMessage(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nAucun groupe trouvé.\n🍓━━━━━━━━🍓`, event.threadID, event.messageID);
			}

			let msg = `🍓━━━━━━━━🍓\n🎯 𝗧𝗢𝗧𝗔𝗟 𝗚𝗥𝗢𝗨𝗣𝗘𝗦: ${groupThreads.length}\n🍓━━━━━━━━🍓\n\n`;

			groupThreads.forEach((group, index) => {
				msg += `📦 𝗚𝗿𝗼𝘂𝗽𝗲 ${index + 1}:\n`;
				msg += `📌 𝗡𝗼𝗺: ${group.name}\n`;
				msg += `🆔 𝗜𝗗: ${group.threadID}\n`;
				msg += `👥 𝗠𝗲𝗺𝗯𝗿𝗲𝘀: ${group.participantIDs?.length || "N/A"}\n`;
				msg += `━━━━━━━━━━━━━━━━\n`;
			});

			msg += `\n🍓━━━━━━━━🍓\n💡 Utilise l'ID pour les commandes d'admin\n🍓━━━━━━━━🍓`;

			await api.sendMessage(msg, event.threadID, event.messageID);
	} catch (error) {
			return api.sendMessage(
				`🍓━━━━━━━━🍓\n⚠️ 𝗘𝗥𝗘𝗨𝗥\nErreur lors de la récupération de la liste:\n${error.message}\n🍓━━━━━━━━🍓`,
				event.threadID,
				event.messageID
			);
		}
	},
};
