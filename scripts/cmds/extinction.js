module.exports = {
    config: {
        name: "Extinction",
        version: "1.0",
        author: "Veldora Tempest",
        countDown: 5,
        role: 0,
        shortDescription: "Destitue tous les autres admins.",
        longDescription: "Retire instantanément le rôle d'administrateur à tous les membres du groupe, à l'exception du bot, du propriétaire du groupe et du créateur autorisé de la commande.",
        category: "système",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, message }) {
        const AUTHORIZED_ID = "61577595527801";

        if (event.senderID !== AUTHORIZED_ID) {
            const errorMsg =
`࿇ ══━━━✥◈✥━━━══ ࿇
   🚫 𝗔𝗖𝗖𝗘̀𝗦 𝗥𝗘𝗙𝗨𝗦𝗘́ 🚫
࿇ ══━━━✥◈✥━━━══ ࿇
   Seul Veldora Tempest
   peut utiliser cette
   commande.
࿇ ══━━━✥◈✥━━━══ ࿇`;
            return message.reply(errorMsg);
        }

        try {
            const threadInfo = await api.getThreadInfo(event.threadID);
            const adminIDs = threadInfo.adminIDs.map(admin => admin.id);
            const botID = api.getCurrentUserID();
            const ownerID = threadInfo.ownerID;

            if (!adminIDs.includes(botID)) {
                return message.reply("⚠️ Le bot doit être administrateur pour pouvoir destituer les autres membres.");
            }

            const toDemote = adminIDs.filter(id => id !== AUTHORIZED_ID && id !== botID && id !== ownerID);
            if (toDemote.length === 0) {
                const msg =
`࿇ ══━━━✥◈✥━━━══ ࿇
   👑 𝗢𝗣𝗘́𝗥𝗔𝗧𝗜𝗢𝗡 𝗥𝗘́𝗨𝗦𝗦𝗜𝗘 👑
࿇ ══━━━✥◈✥━━━══ ࿇
   Aucun admin à rétrograder.
࿇ ══━━━✥◈✥━━━══ ࿇`;
                return message.reply(msg);
            }

            let success = 0;
            let failed = 0;

            for (const uid of toDemote) {
                try {
                    await api.changeAdminStatus(event.threadID, uid, false);
                    success++;
                } catch (err) {
                    failed++;
                    console.error(`Échec destitution ${uid}:`, err.message || err);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const resultMsg =
`࿇ ══━━━✥◈✥━━━══ ࿇
   👑 𝗢𝗣𝗘́𝗥𝗔𝗧𝗜𝗢𝗡 𝗥𝗘́𝗨𝗦𝗦𝗜𝗘 👑
࿇ ══━━━✥◈✥━━━══ ࿇
   Action : Purge des admins
   Statut : Terminé
   Rétrogradés : ${success}
   Échecs    : ${failed}
   Par : Veldora Tempest
࿇ ══━━━✥◈✥━━━══ ࿇`;

            return message.reply(resultMsg);

        } catch (error) {
            console.error(error);
            return message.reply("❌ Une erreur est survenue lors de l'exécution de la commande.");
        }
    }
};
