const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const bgUrls = [
  "https://i.imgur.com/02t5Ix3.gif",
  "https://i.imgur.com/AyIAqjE.gif",
  "https://i.imgur.com/x9cAPDl.gif",
  "https://i.imgur.com/4HLXoeZ.gif",
  "https://i.imgur.com/QFlSaOA.gif",
  "https://i.imgur.com/mlvEALb.gif",
  "https://i.imgur.com/bN82wyK.gif",
  "https://i.imgur.com/FGEBT3B.gif",
  "https://i.imgur.com/t6nron8.gif",
  "https://i.imgur.com/46yg66T.gif",
  "https://i.imgur.com/hMdQPJ9.gif",
  "https://i.imgur.com/k4B6wc2.gif",
  "https://i.imgur.com/k6Tb8IU.gif",
  "https://i.imgur.com/45LT900.gif",
  "https://i.imgur.com/v5SrfFv.gif"
];

function toBold(text) {
  const map = {
    A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
    K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
    U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
    a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
    k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
    u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳"
  };
  return text.split('').map(c => map[c] || c).join('');
}

function normalizeCategory(cat) {
  if (!cat) return "other";
  return cat.toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "").trim();
}

function cleanCategoryName(cat) {
  if (!cat) return "OTHER";
  return cat.trim().toUpperCase();
}

function roleText(role) {
  if (role == 0) return "All users";
  if (role == 1) return "Group admin";
  if (role == 2) return "Bot admin";
  return "Unknown";
}

async function sendHelpPage(pageIndex, pages, message, senderID) {
  const text = pages[pageIndex];
  const gifUrl = bgUrls[pageIndex % bgUrls.length];

  let attachmentStream = null;
  try {
    const response = await axios.get(gifUrl, {
      responseType: "stream",
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const tmpDir = path.join(__dirname, "../tmp");
    fs.ensureDirSync(tmpDir);
    const tmpPath = path.join(tmpDir, `help_${senderID}_${Date.now()}.gif`);
    const writer = fs.createWriteStream(tmpPath);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    attachmentStream = fs.createReadStream(tmpPath);
    setTimeout(() => { try { fs.unlinkSync(tmpPath); } catch {} }, 15000);
  } catch (err) {
    console.error("[help] GIF download error:", err.message);
  }

  try {
    return await message.reply({
      body: text,
      attachment: attachmentStream || undefined
    });
  } catch {
    return await message.reply({
      body: text,
      attachment: attachmentStream ? [attachmentStream] : undefined
    });
  }
}

module.exports = {
  config: {
    name: "help",
    version: "11.0",
    author: "Raijin Kaminari",
    role: 0,
    category: "info"
  },

  onStart: async function ({ message, args, event, usersData, api }) {
    const { getPrefix } = global.utils;
    const prefix = await getPrefix(event.threadID);
    const senderID = event.senderID;
    const { commands, aliases } = global.GoatBot;

    const categories = {};
    for (const [name, value] of commands) {
      const rawCat = value.config?.category || "OTHER";
      const key = normalizeCategory(rawCat);
      if (!categories[key]) {
        categories[key] = { displayName: cleanCategoryName(rawCat), cmds: new Set() };
      }
      categories[key].cmds.add(name);
    }

    const allCmds = [];
    Object.values(categories)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .forEach(cat => {
        const sorted = [...cat.cmds].sort((a, b) => a.localeCompare(b));
        sorted.forEach(cmd => allCmds.push({ name: cmd, category: cat.displayName }));
      });

    const perPage = 10;
    const pages = [];
    for (let i = 0; i < allCmds.length; i += perPage) {
      const chunk = allCmds.slice(i, i + perPage);
      let text = `📄 Page ${pages.length + 1}/${Math.ceil(allCmds.length / perPage)}\n`;
      const byCat = {};
      chunk.forEach(cmd => {
        if (!byCat[cmd.category]) byCat[cmd.category] = [];
        byCat[cmd.category].push(cmd.name);
      });
      for (const [cat, names] of Object.entries(byCat)) {
        text += `\n【 ${toBold(cat)} 】\n`;
        names.forEach(n => text += `➩ ${toBold(n)} 🌹\n`);
      }
      text += `\n✨ Total: ${commands.size} commandes\n`;
      text += `📌 Use: ${prefix}help <commande>`;
      pages.push(text);
    }

    let targetPage = 0;
    if (args[0]) {
      if (/^\d+$/.test(args[0])) {
        const pageNum = parseInt(args[0]);
        if (pageNum < 1 || pageNum > pages.length) {
          return message.reply(`❌ Page ${pageNum} invalide. Il y a ${pages.length} page(s).`);
        }
        targetPage = pageNum - 1;
      } else {
        const cmdName = args[0].toLowerCase();
        const cmd = commands.get(cmdName) || commands.get(aliases.get(cmdName));
        if (!cmd) return message.reply(`❌ Commande "${cmdName}" introuvable.`);

        const cfg = cmd.config;
        return message.reply(
`╔『 📌ℂ𝕆𝕄𝕄𝔸𝔻 𝕀ℕ𝔽𝕆』╗

➩ Name: ${toBold(cfg.name)}
➩ Description: ${cfg.longDescription?.en || "Aucune description"}
➩ Aliases: ${cfg.aliases?.join(", ") || "Aucun"}
➩ Version: ${cfg.version || "1.0"}
➩ Role: ${roleText(cfg.role)}
➩ Cooldown: ${cfg.countDown || 2}s
➩ Author: ${cfg.author || "Unknown"}

📖 Usage:
${toBold((cfg.guide?.en || "Aucun guide")
  .replace(/{pn}/g, prefix)
  .replace(/{n}/g, cfg.name))}

╚═══════════════╝`
        );
      }
    }

    const sent = await sendHelpPage(targetPage, pages, message, senderID);
    const msgID = sent.messageID;

    if (pages.length > 1) {
      try {
        await message.react("◀️");
        const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
        for (let i = 0; i < Math.min(pages.length, 10); i++) {
          await message.react(numEmojis[i]);
        }
        await message.react("▶️");
      } catch {}
    }

    global.GoatBot.onReaction.set(msgID, {
      commandName: "help",
      pages,
      currentPage: targetPage,
      userID: senderID,
      messageID: msgID
    });

    setTimeout(() => {
      global.GoatBot.onReaction.delete(msgID);
    }, 300000);
  },

  onReaction: async function ({ message, event, Reaction, api }) {
    const { pages, currentPage, userID, messageID } = Reaction;
    if (event.userID !== userID) return;

    const emoji = event.reaction;
    let newPage = currentPage;

    if (emoji === "▶️") {
      newPage = Math.min(currentPage + 1, pages.length - 1);
    } else if (emoji === "◀️") {
      newPage = Math.max(currentPage - 1, 0);
    } else {
      const idx = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"].indexOf(emoji);
      if (idx !== -1 && idx < pages.length) newPage = idx;
    }

    if (newPage !== currentPage) {
      try {
        await api.unsendMessage(messageID).catch(() => {});
        const newSent = await sendHelpPage(newPage, pages, message, userID);
        const newMsgID = newSent.messageID;

        Reaction.currentPage = newPage;
        Reaction.messageID = newMsgID;
        global.GoatBot.onReaction.set(newMsgID, Reaction);
        global.GoatBot.onReaction.delete(messageID);

        if (pages.length > 1) {
          try {
            await api.setMessageReaction(newMsgID, "◀️", false);
            const numEmojis = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟"];
            for (let i = 0; i < Math.min(pages.length, 10); i++) {
              await api.setMessageReaction(newMsgID, numEmojis[i], false);
            }
            await api.setMessageReaction(newMsgID, "▶️", false);
          } catch {}
        }

        clearTimeout(Reaction._timeout);
        Reaction._timeout = setTimeout(() => {
          global.GoatBot.onReaction.delete(newMsgID);
        }, 300000);

      } catch (err) {
        console.error("[help] page change error:", err.message);
      }
    }

    try {
      await api.setMessageReaction(event.messageID, "🗑️", false);
    } catch {}
  }
};
