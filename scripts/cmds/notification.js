const { getStreamsFromAttachment } = global.utils;
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Images aléatoires Ayanokoji
const RANDOM_IMAGES = [
  "https://i.ibb.co/35smRFhJ/c9aad08f2577.jpg",
  "https://i.ibb.co/7JDfhZTm/c26195ff6d3c.jpg",
  "https://i.ibb.co/zhb9wXWV/80e5f0c36e7a.jpg"
];

// Stockage temporaire pour notifications et réponses
const notificationMemory = {};
const adminReplies = {};

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "7.0",
    author: "NTKhang x Christus -> Ayanokoji Style",
    editor: "Camille Uchiha",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "Broadcast system | Ayanokoji style",
    longDescription: "Envoi de notification système à tous les groupes. Design minimaliste.",
    guide: { en: `Usage: {pn} <message>\nSupport: Texte + Image en réponse` },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, api, event, threadsData, envCommands, commandName, args }) {
    const { delayPerGroup = 300 } = envCommands[commandName] || {};
    if (!args[0]) return message.reply(`[SYSTEM] ERREUR: Message requis.`);

    // Prend une image aléatoire Ayanokoji
    const imageUrl = RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)];
    const cachePath = path.join(__dirname, 'cache', `noti_${Date.now()}.jpg`);

    if (!fs.existsSync(path.dirname(cachePath))) {
      fs.mkdirSync(path.dirname(cachePath), { recursive: true });
    }
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(cachePath, Buffer.from(response.data));

    const allThreads = (await threadsData.getAll())
    .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply(`[SYSTEM] INFO: Aucun groupe.`);

    message.reply(`[SYSTEM] Envoi en cours... Cibles: ${allThreads.length}`);

    let sendSuccess = 0;
    const sendError = [];

    for (const thread of allThreads) {
      let groupName = thread.name || "Unknown";
      if (!thread.name) {
        try { const info = await api.getThreadInfo(thread.threadID); groupName = info.threadName || groupName; } catch {}
      }

      const notificationBody =
`[NOTIFICATION SYSTEM]
Group: ${groupName}
---
${args.join(" ")}
---
Sender: Admin`;

      const formSend = {
        body: notificationBody,
        attachment: [
          fs.createReadStream(cachePath),
        ...await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
          ])
        ]
      };

      try {
        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName };
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) { sendError.push({ threadID: thread.threadID, groupName, error: err.message }); }
    }

    setTimeout(() => fs.unlinkSync(cachePath), 5000);

    let bilan =
`[BILAN]
Success: ${sendSuccess}
Failed: ${sendError.length}`;
    if (sendError.length) sendError.forEach(err => { bilan += `\n- ${err.groupName}: ${err.error}`; });
    message.reply(bilan.trim());
  },

  onMessage: async function({ api, event }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key => key.endsWith(`_${repliedMsgID}`));
    if (!notificationKey) return;

    const { groupName } = notificationMemory[notificationKey];
    const userName = event.senderName;
    const userID = event.senderID;

    const adminMessage =
`[REPONSE DETECTEE]
From: ${userName} | ID: ${userID}
Group: ${groupName}
Message:
${event.body}
---
Reply to this message to respond.`;

    const allThreads = await api.getThreadList(1000, null, ['INBOX']);
    const adminIDs = allThreads
    .filter(t => t.isGroup)
    .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
    const uniqueAdmins = [...new Set(adminIDs)];

    for (const adminID of uniqueAdmins) {
      try {
        const sent = await api.sendMessage(adminMessage, adminID);
        adminReplies[sent.messageID] = {
          originalThreadID: event.threadID,
          userID
        };
      } catch {}
    }
  },

  onReply: async function({ api, event }) {
    const replyData = adminReplies[event.messageReply?.messageID];
    if (!replyData) return;

    const { originalThreadID, userID } = replyData;
    try {
      await api.sendMessage(
`[ADMIN RESPONSE]
${event.body}`, originalThreadID || userID);
      delete adminReplies[event.messageReply.messageID];
    } catch {}
  }
};
