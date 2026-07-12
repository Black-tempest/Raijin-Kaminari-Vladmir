const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "notification",
    aliases: ["noti"],
    version: "1.4",
    author: "Raijin Kaminari",
    role: 2,
    category: "admin",
    description: "Envoie une notification globale à tous les groupes avec barre de progression"
  },

  onStart: async function ({ message, args, api, event, usersData }) {
    if (!args[0]) return message.reply("❌ Veuillez entrer le message à diffuser.");

    const msg = args.join(" ");
    const senderID = event.senderID;
    const adminName = await usersData.getName(senderID) || "Admin";

    return message.reply(
`▬▬▬▬▬▬▬▬▬▬▬▬
⚠️ 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗧𝗜𝗢𝗡
▬▬▬▬▬▬▬▬▬▬▬▬

👤 Admin : ${adminName}
📝 Message à diffuser :
${msg}

Voulez-vous vraiment envoyer cette notification ?
Tapez **oui** pour confirmer ou **non** pour annuler.
▬▬▬▬▬▬▬▬▬▬▬▬`,
      (err, info) => {
        if (err) return;
        global.GoatBot.confirmations = global.GoatBot.confirmations || [];
        global.GoatBot.confirmations.push({
          messageID: info.messageID,
          adminID: senderID,
          adminName: adminName,
          messageContent: msg,
          threadID: event.threadID
        });
      }
    );
  },

  onChat: async function ({ event, api, usersData }) {
    if (!event.body || !global.GoatBot.confirmations) return;

    const replyText = event.body.toLowerCase().trim();
    if (replyText !== "oui" && replyText !== "non") return;

    const senderID = event.senderID;
    const confirmEntry = global.GoatBot.confirmations.find(
      c => c.adminID === senderID && c.messageID === event.messageReply?.messageID
    );
    if (!confirmEntry) return;

    global.GoatBot.confirmations = global.GoatBot.confirmations.filter(c => c !== confirmEntry);

    if (replyText === "non") {
      return api.sendMessage("❌ Notification annulée.", event.threadID);
    }

    const { adminName, messageContent, threadID: sourceThreadID } = confirmEntry;

    let sourceGroupName = "Inconnu";
    try {
      const sourceThreadInfo = await api.getThreadInfo(sourceThreadID);
      sourceGroupName = sourceThreadInfo.threadName || "Groupe sans nom";
    } catch {}

    const allThreads = await api.getThreadList(100, null, ["INBOX"]);
    const total = allThreads.length;
    let success = 0;
    let fail = 0;
    const sentMessages = [];

    const progressMsg = await api.sendMessage(
      `📡 Début de l'envoi...\n[▒▒▒▒▒▒▒▒▒▒] 0% (0/${total})`,
      sourceThreadID
    );
    const progressMsgID = progressMsg.messageID;

    const updateProgress = async (current, total, successCount, failCount) => {
      const percent = Math.floor((current / total) * 100);
      const filled = Math.floor(percent / 10);
      const bar = "▓".repeat(filled) + "▒".repeat(10 - filled);
      await api.editMessage(
        `📡 Envoi en cours...\n[${bar}] ${percent}% (${successCount + failCount}/${total})`,
        progressMsgID
      );
    };

    for (let i = 0; i < allThreads.length; i++) {
      const thread = allThreads[i];
      const tid = thread.threadID;
      let targetName = "Inconnu";
      try {
        const tInfo = await api.getThreadInfo(tid);
        targetName = tInfo.threadName || "Groupe sans nom";
      } catch {}

      const notificationText =
`▬▬▬▬▬▬▬▬▬▬▬▬
⚠️ 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗚𝗟𝗢𝗕𝗔𝗟𝗘 ⚠️
▬▬▬▬▬▬▬▬▬▬▬▬

📢 Message de l'admin : ${adminName}
📌 Envoyé depuis : ${sourceGroupName}
📌 Groupe : ${targetName}

${messageContent}

▬▬▬▬▬▬▬▬▬▬▬▬
👑 Créateur : Raijin Kaminari
▬▬▬▬▬▬▬▬▬▬▬▬`;

      try {
        const sentMsg = await api.sendMessage(notificationText, tid);
        sentMessages.push({ messageID: sentMsg.messageID, threadID: tid });
        success++;
      } catch {
        fail++;
      }

      if ((i + 1) % 3 === 0 || i === allThreads.length - 1) {
        await updateProgress(i + 1, total, success, fail);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    await updateProgress(allThreads.length, total, success, fail);

    const finalReport =
`✅ Notification terminée.

▬▬▬▬▬▬▬▬▬▬▬▬
📤 Envoyé depuis : ${sourceGroupName}
📊 Succès : ${success}
❌ Échecs : ${fail}
▬▬▬▬▬▬▬▬▬▬▬▬
👑 Créateur : Raijin Kaminari`;

    await api.editMessage(finalReport, progressMsgID);

    if (!global.GoatBot.notifications) global.GoatBot.notifications = [];
    global.GoatBot.notifications.push({
      adminID: senderID,
      adminName,
      sourceGroupName,
      sentMessages,
      timestamp: Date.now()
    });

    setTimeout(() => {
      global.GoatBot.notifications = (global.GoatBot.notifications || []).filter(
        n => n.adminID !== senderID || n.timestamp !== Date.now()
      );
    }, 86400000);
  },

  onReply: async function ({ event, api, usersData }) {
    if (!global.GoatBot.notifications) return;

    const replyToID = event.messageReply?.messageID;
    if (!replyToID) return;

    for (let i = global.GoatBot.notifications.length - 1; i >= 0; i--) {
      const notif = global.GoatBot.notifications[i];
      const found = notif.sentMessages.some(m => m.messageID === replyToID);
      if (!found) continue;

      const replierID = event.senderID;
      const replierName = await usersData.getName(replierID) || "Utilisateur inconnu";
      const replyContent = event.body || "[Pièce jointe]";

      let groupName = "Inconnu";
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        groupName = threadInfo.threadName || "Groupe sans nom";
      } catch {}

      const msgToAdmin =
`▬▬▬▬▬▬▬▬▬▬▬▬
💬 𝗥𝗘𝗣𝗟𝗬 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡
▬▬▬▬▬▬▬▬▬▬▬▬

👤 Utilisateur : ${replierName}
📌 Groupe : ${groupName}
📩 Message :
${replyContent}

▬▬▬▬▬▬▬▬▬▬▬▬
👑 Répondu depuis la notification de ${notif.adminName}
▬▬▬▬▬▬▬▬▬▬▬▬`;

      try {
        await api.sendMessage(msgToAdmin, notif.adminID);
      } catch {
        try {
          const adminThreadInfo = await api.getThreadInfo(notif.adminID);
          if (adminThreadInfo.isGroup) {
            await api.sendMessage(msgToAdmin, notif.adminID);
          }
        } catch {}
      }
      break;
    }
  }
};
