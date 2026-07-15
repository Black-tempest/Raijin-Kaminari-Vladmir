const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

const bgImages = [
  "https://i.ibb.co/vxxVjgyz/80fbf8c6617f.jpg",
  "https://i.ibb.co/8LyVCBYx/994e8a5f509e.jpg",
  "https://i.ibb.co/N6NqgHHg/852165402999.jpg",
  "https://i.ibb.co/27QzrshX/91c0ac4416b0.jpg",
  "https://i.ibb.co/zHXgFgyS/bb743523e49e.jpg",
  "https://i.ibb.co/rGwZYr9b/a1bc806cd1c0.jpg"
];

async function generateNotificationImage(messageText) {
  const W = 800, H = 600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const bgUrl = bgImages[Math.floor(Math.random() * bgImages.length)];
  try {
    const resp = await axios.get(bgUrl, { responseType: "arraybuffer", timeout: 10000 });
    const bg = await loadImage(Buffer.from(resp.data));
    ctx.drawImage(bg, 0, 0, W, H);
  } catch {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, W, H);
  }

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, W, H);

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR");
  const timeStr = now.toLocaleTimeString("fr-FR");
  const dateTime = `${dateStr} ${timeStr}`;

  const colors = ["#ff4d4d", "#4dff4d", "#4d4dff", "#ffff4d", "#ff4dff", "#4dffff"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  ctx.textAlign = "center";
  ctx.font = "bold 36px 'Segoe UI', Arial";
  ctx.fillStyle = color;
  ctx.shadowColor = "#000";
  ctx.shadowBlur = 10;
  ctx.fillText("⚠️ NOTIFICATION GLOBALE ⚠️", W / 2, 80);

  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(dateTime, W / 2, 130);

  ctx.font = "bold 28px Arial";
  ctx.fillStyle = "#ffffff";
  const lines = messageText.split("\n");
  let y = 200;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += 40;
  }

  ctx.shadowBlur = 0;
  return canvas.toBuffer("image/png");
}

async function getAdminGroupID(api) {
  if (global.adminGroupID && Date.now() - global.adminGroupID.timestamp < 300000) {
    return global.adminGroupID.id;
  }
  const threads = await api.getThreadList(100, null, ["INBOX"]);
  for (const thread of threads) {
    if (thread.threadName && thread.threadName.toLowerCase().includes("admin")) {
      global.adminGroupID = { id: thread.threadID, timestamp: Date.now() };
      return thread.threadID;
    }
  }
  return null;
}

module.exports = {
  config: {
    name: "notification",
    aliases: ["noti"],
    version: "7.4",
    author: "Raijin Kaminari",
    role: 2,
    category: "admin",
    description: "Notification globale avec conversation illimitée admin-utilisateur."
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
    const body = event.body || "";
    const senderID = event.senderID;

    if (!global.GoatBot.replyContexts) global.GoatBot.replyContexts = [];

    if (event.messageReply && global.GoatBot.replyContexts.length > 0) {
      const replyToID = event.messageReply.messageID;
      const ctx = global.GoatBot.replyContexts.find(c => c.adminMsgID === replyToID || c.userMsgID === replyToID);
      if (ctx) {
        const isAdminReply = (ctx.adminMsgID === replyToID && senderID === ctx.adminID);
        const isUserReply = (ctx.userMsgID === replyToID && senderID === ctx.userID);

        if (isAdminReply || isUserReply) {
          let replyText = body || "[Message vide]";
          const attachments = event.attachments || [];
          const attUrls = attachments.map(att => att.url).filter(url => url);

          if (isAdminReply) {
            const userReplyMsg =
`▬▬▬▬▬▬▬▬▬▬▬▬
💬 𝗥𝗘𝗣𝗢𝗡𝗦𝗘 𝗔𝗗𝗠𝗜𝗡
▬▬▬▬▬▬▬▬▬▬▬▬

👤 Admin : ${ctx.adminName}
📩 Message :
${replyText}

▬▬▬▬▬▬▬▬▬▬▬▬`;
            try {
              const sent = await api.sendMessage(
                { body: userReplyMsg, attachment: attUrls.length > 0 ? attUrls : undefined },
                ctx.userThreadID
              );
              ctx.userMsgID = sent.messageID;
              await api.sendMessage("✅ Votre réponse a été transmise à l'utilisateur.", event.threadID);
            } catch (err) {
              await api.sendMessage("❌ Échec de la transmission de votre réponse.", event.threadID);
            }
          } else {
            const adminMsgBody =
`▬▬▬▬▬▬▬▬▬▬▬▬
💬 𝗥𝗘𝗣𝗟𝗬 𝗨𝗧𝗜𝗟𝗜𝗦𝗔𝗧𝗘𝗨𝗥
▬▬▬▬▬▬▬▬▬▬▬▬

👤 Utilisateur : ${ctx.userName || "Utilisateur"}
📌 Groupe : ${ctx.userGroupName || "Inconnu"}
📩 Message :
${replyText}

▬▬▬▬▬▬▬▬▬▬▬▬
👑 En réponse à ${ctx.adminName}
▬▬▬▬▬▬▬▬▬▬▬▬`;

            let sent = false;
            const sendOptions = {
              body: adminMsgBody,
              attachment: attUrls.length > 0 ? attUrls : undefined
            };

            const adminGroupID = await getAdminGroupID(api);
            if (adminGroupID) {
              try {
                const sentMsg = await api.sendMessage(sendOptions, adminGroupID);
                ctx.adminMsgID = sentMsg.messageID;
                sent = true;
              } catch (e) {}
            }

            if (!sent) {
              try {
                const sentMsg = await api.sendMessage(sendOptions, ctx.sourceThreadID || adminGroupID || ctx.adminID);
                ctx.adminMsgID = sentMsg.messageID;
                sent = true;
              } catch (e2) {
                try {
                  const sentMsg = await api.sendMessage(sendOptions, ctx.adminID);
                  ctx.adminMsgID = sentMsg.messageID;
                  sent = true;
                } catch (e3) {}
              }
            }

            await api.sendMessage(
              sent ? "✅ Votre réponse a été transmise à l'administrateur." : "❌ Échec de la transmission.",
              event.threadID
            );
          }
          return;
        }
      }
    }

    if (global.GoatBot.notifications && event.messageReply) {
      const replyToID = event.messageReply.messageID;
      for (let i = global.GoatBot.notifications.length - 1; i >= 0; i--) {
        const notif = global.GoatBot.notifications[i];
        const found = notif.sentMessages.some(m => m.messageID === replyToID);
        if (!found) continue;

        const replierID = senderID;
        let replierName = "Utilisateur inconnu";
        try { replierName = await usersData.getName(replierID); } catch {}

        let replyContent = body || "[Contenu non textuel]";
        const attachments = event.attachments || [];

        let groupName = "Inconnu";
        try {
          const threadInfo = await api.getThreadInfo(event.threadID);
          groupName = threadInfo.threadName || "Groupe sans nom";
        } catch {}

        const adminMsgBody =
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

        const adminAttachments = attachments.map(att => att.url).filter(url => url);

        let sent = false;
        let adminMsgID = null;
        const sendOptions = {
          body: adminMsgBody,
          attachment: adminAttachments.length > 0 ? adminAttachments : undefined
        };

        const adminGroupID = await getAdminGroupID(api);
        if (adminGroupID) {
          try {
            const sentMsg = await api.sendMessage(sendOptions, adminGroupID);
            adminMsgID = sentMsg.messageID;
            sent = true;
          } catch (e) {}
        }

        if (!sent) {
          try {
            const sentMsg = await api.sendMessage(sendOptions, notif.sourceThreadID);
            adminMsgID = sentMsg.messageID;
            sent = true;
          } catch (e2) {
            try {
              const sentMsg = await api.sendMessage(sendOptions, notif.adminID);
              adminMsgID = sentMsg.messageID;
              sent = true;
            } catch (e3) {}
          }
        }

        if (sent && adminMsgID) {
          global.GoatBot.replyContexts.push({
            adminMsgID: adminMsgID,
            userMsgID: null,
            adminID: notif.adminID,
            adminName: notif.adminName,
            userID: replierID,
            userName: replierName,
            userThreadID: event.threadID,
            userGroupName: groupName,
            sourceThreadID: notif.sourceThreadID,
            timestamp: Date.now()
          });
        }

        await api.sendMessage(
          sent ? "✅ Votre réponse a bien été envoyée à l'administrateur. Il pourra vous répondre." : "❌ Échec de l'envoi.",
          event.threadID
        );
        return;
      }
    }

    if (global.GoatBot.replyContexts.length > 50) {
      const now = Date.now();
      global.GoatBot.replyContexts = global.GoatBot.replyContexts.filter(ctx => now - ctx.timestamp < 86400000);
    }

    if (!body || !global.GoatBot.confirmations) return;

    const replyText = body.toLowerCase().trim();
    if (replyText !== "oui" && replyText !== "non") return;

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

    const imageBuffer = await generateNotificationImage(messageContent);
    const tmpDir = path.join(__dirname, "../tmp");
    fs.ensureDirSync(tmpDir);
    const tmpImagePath = path.join(tmpDir, `notif_${Date.now()}.png`);
    fs.writeFileSync(tmpImagePath, imageBuffer);

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

    if (!global.GoatBot.notifications) global.GoatBot.notifications = [];
    global.GoatBot.notifications.push({
      adminID: senderID,
      adminName,
      sourceGroupName,
      sourceThreadID: sourceThreadID,
      sentMessages,
      timestamp: Date.now()
    });

    const updateProgress = async (current) => {
      const percent = Math.floor((current / total) * 100);
      const filled = Math.floor(percent / 10);
      const bar = "▓".repeat(filled) + "▒".repeat(10 - filled);
      try {
        await api.editMessage(
          `📡 Envoi en cours...\n[${bar}] ${percent}% (${success + fail}/${total})`,
          progressMsgID
        );
      } catch {}
    };

    for (let i = 0; i < allThreads.length; i++) {
      const tid = allThreads[i].threadID;
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
        const stream = fs.createReadStream(tmpImagePath);
        const sentMsg = await api.sendMessage(
          { body: notificationText, attachment: stream },
          tid
        );
        sentMessages.push({ messageID: sentMsg.messageID, threadID: tid });
        success++;
      } catch {
        fail++;
      }

      await updateProgress(i + 1);
      if (i < allThreads.length - 1) await new Promise(resolve => setTimeout(resolve, 300));
    }

    try { fs.unlinkSync(tmpImagePath); } catch {}

    const finalReport =
`✅ Notification terminée.

▬▬▬▬▬▬▬▬▬▬▬▬
📤 Envoyé depuis : ${sourceGroupName}
📊 Succès : ${success}
❌ Échecs : ${fail}
▬▬▬▬▬▬▬▬▬▬▬▬
👑 Créateur : Raijin Kaminari`;

    try {
      await api.editMessage(finalReport, progressMsgID);
    } catch {}

    const notifEntry = global.GoatBot.notifications.find(n => n.adminID === senderID && n.timestamp === Date.now());
    if (notifEntry) notifEntry.sentMessages = sentMessages;

    setTimeout(() => {
      global.GoatBot.notifications = (global.GoatBot.notifications || []).filter(
        n => n.adminID !== senderID || n.timestamp !== Date.now()
      );
    }, 86400000);
  }
};
