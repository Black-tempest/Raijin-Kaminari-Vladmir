const fs = require("fs-extra");
const axios = require("axios");
const validUrl = require("valid-url");
const path = require("path");

// 🤖 MINI BOT API
const API_ENDPOINT = "https://shizuai.vercel.app/chat";
const CLEAR_ENDPOINT = "https://shizuai.vercel.app/chat/clear";

// 👑 OWNER
const MASTER_ID = "61591108301616";
const MASTER_NAME = "Camille Uchiha 🌸";

// =======================
// 📥 DOWNLOAD FILE
// =======================
async function downloadFile(url, ext = "jpg") {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(__dirname, `cache_${Date.now()}.${ext}`);
  await fs.writeFile(filePath, res.data);
  return filePath;
}

// =======================
// 🤖 AI CORE
// =======================
async function handleAI(api, event, args, message) {
  const userId = event.senderID;
  const userInput = args.join(" ");

  let text = userInput;
  let imageUrl = null;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  // 🔍 detect URL image
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    text = text.replace(urlMatch, "").trim();
  }

  if (!text && !imageUrl) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply("╭─❖─ mini Bot ─❖─╮\n│ Message requis\n╰─❖─❖─❖─╯");
  }

  try {
    const userInfo = await api.getUserInfo(userId);
    const userName = userInfo[userId]?.name || "User";

    const res = await axios.post(API_ENDPOINT, {
      uid: userId,
      message: text,
      image_url: imageUrl
    });

    const { reply, image_url } = res.data;

    let finalReply = reply || "Je n'ai pas compris 😅";

    // 🧼 clean unwanted names
    finalReply = finalReply
      .replace(/shizu/gi, "mini Bot")
      .replace(/ayanokoji/gi, "mini Bot")
      .replace(/christus/gi, "");

    // 👑 owner logic
    if (/créateur|owner|dev|maître/i.test(text)) {
      if (userId === MASTER_ID) {
        finalReply = `😳 Maître ${MASTER_NAME}\nJe suis à votre service 👑`;
      } else {
        finalReply = `🤖 Mon créateur est ${MASTER_NAME}\nJe suis mini Bot fun et divertissant 😄`;
      }
    }

    // 📸 attachments
    const attachments = [];
    if (image_url) {
      const file = await downloadFile(image_url, "jpg");
      attachments.push(fs.createReadStream(file));
    }

    const sent = await message.reply({
      body:
`╭─❖─ mini Bot ─❖─╮
│ ${finalReply}
╰─❖─❖─❖─╯`,
      attachment: attachments.length ? attachments : undefined
    });

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "ai",
      author: userId
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("╭─❖─ mini Bot ERROR ─❖─╮\n│ " + err.message + "\n╰─❖─❖─❖─╯");
  }
}

// =======================
// 📦 EXPORT (IMPORTANT FIX)
// =======================
module.exports = {
  config: {
    name: "ai",
    aliases: ["minibot", "bot"],
    version: "1.0",
    author: "Camille Uchiha",
    role: 0,
    countDown: 3,
    shortDescription: "mini Bot IA fun",
    longDescription: "Assistant IA fun et divertissant",
    category: "ai",
    guide: "{pn} <message>"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!Array.isArray(args)) args = [];
    return handleAI(api, event, args, message);
  },

  onReply: async function ({ api, event, args, message }) {
    if (!Array.isArray(args)) args = [];
    return handleAI(api, event, args, message);
  }
};
