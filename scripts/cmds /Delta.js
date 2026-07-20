const fs = require("fs-extra");
const axios = require("axios");
const validUrl = require("valid-url");
const path = require("path");

const API_ENDPOINT = "https://text.pollinations.ai/";
const MASTER_ID = "61577595527801";
const MASTER_NAME = "Veldora Tempest";

const SYSTEM_PROMPT = `Tu es ∫𝐃𝐄𝐋𝐓𝐀∫ ™, une IA créée par Veldora Tempest.
Tu es confiant, serviable et tu réponds toujours en français avec clarté et politesse.
Tu es fier de ton créateur. Ne mentionne jamais OpenAI, ChatGPT ou tout autre modèle.
Lorsqu’on te demande qui t’a créé, réponds fièrement que c’est Veldora Tempest.`;

function toMathematicalBold(text) {
  const boldMap = {
    'A': '\u{1D400}', 'B': '\u{1D401}', 'C': '\u{1D402}', 'D': '\u{1D403}',
    'E': '\u{1D404}', 'F': '\u{1D405}', 'G': '\u{1D406}', 'H': '\u{1D407}',
    'I': '\u{1D408}', 'J': '\u{1D409}', 'K': '\u{1D40A}', 'L': '\u{1D40B}',
    'M': '\u{1D40C}', 'N': '\u{1D40D}', 'O': '\u{1D40E}', 'P': '\u{1D40F}',
    'Q': '\u{1D410}', 'R': '\u{1D411}', 'S': '\u{1D412}', 'T': '\u{1D413}',
    'U': '\u{1D414}', 'V': '\u{1D415}', 'W': '\u{1D416}', 'X': '\u{1D417}',
    'Y': '\u{1D418}', 'Z': '\u{1D419}',
    'a': '\u{1D41A}', 'b': '\u{1D41B}', 'c': '\u{1D41C}', 'd': '\u{1D41D}',
    'e': '\u{1D41E}', 'f': '\u{1D41F}', 'g': '\u{1D420}', 'h': '\u{1D421}',
    'i': '\u{1D422}', 'j': '\u{1D423}', 'k': '\u{1D424}', 'l': '\u{1D425}',
    'm': '\u{1D426}', 'n': '\u{1D427}', 'o': '\u{1D428}', 'p': '\u{1D429}',
    'q': '\u{1D42A}', 'r': '\u{1D42B}', 's': '\u{1D42C}', 't': '\u{1D42D}',
    'u': '\u{1D42E}', 'v': '\u{1D42F}', 'w': '\u{1D430}', 'x': '\u{1D431}',
    'y': '\u{1D432}', 'z': '\u{1D433}',
    '0': '\u{1D7CE}', '1': '\u{1D7CF}', '2': '\u{1D7D0}', '3': '\u{1D7D1}',
    '4': '\u{1D7D2}', '5': '\u{1D7D3}', '6': '\u{1D7D4}', '7': '\u{1D7D5}',
    '8': '\u{1D7D6}', '9': '\u{1D7D7}'
  };
  let result = '';
  for (const char of text) {
    result += boldMap[char] || char;
  }
  return result;
}

const BOT_BRAND = toMathematicalBold("DELTA");

async function downloadFile(url, ext = "jpg") {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const filePath = path.join(__dirname, `cache_${Date.now()}.${ext}`);
  await fs.writeFile(filePath, res.data);
  return filePath;
}

async function handleAI(api, event, args, message) {
  const userId = event.senderID;
  const userInput = args.join(" ");

  let text = userInput;
  let imageUrl = null;

  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  const urlMatch = text.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    text = text.replace(urlMatch, "").trim();
  }

  if (!text && !imageUrl) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply(
      `✦ ∫${BOT_BRAND}∫ ™\n⊙▭▭▭▭❀▭▭▭▭⊙\n│ Message requis\n✧▭▭▭▭▭▭✧\n             ∫©∫\n✧▭▭▭▭▭▭✧`
    );
  }

  const creatorRegex = /(qui (t'|ta?|vous) a (créé|créer?|fait|programmé|développé|inventé)|créateur|createur|owner|dev|maître|maitre|développeur|developpeur|programmeur|concepteur|qui est ton (papa|créateur|createur|développeur|developpeur|maître|maitre)|t'as fait qui|t'as créé qui)/i;

  if (creatorRegex.test(text)) {
    let finalReply;
    if (userId === MASTER_ID) {
      finalReply = `Monarque ${MASTER_NAME}, vous êtes mon créateur suprême. Votre serviteur ∫${BOT_BRAND}∫ est à vos ordres, majesté. 👑`;
    } else {
      finalReply = `Je suis ∫${BOT_BRAND}∫ ™, créé avec passion par ${MASTER_NAME}. C'est mon créateur et je suis fier de l'assister ! 😄`;
    }

    finalReply = toMathematicalBold(finalReply);

    const sent = await message.reply({
      body: `✦ ∫${BOT_BRAND}∫ ™\n⊙▭▭▭▭❀▭▭▭▭⊙\n│ ${finalReply}\n✧▭▭▭▭▭▭✧\n             ∫©∫\n✧▭▭▭▭▭▭✧`
    });

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "Delta",
      author: userId
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);
    return;
  }

  if (imageUrl && !text) {
    text = "Regarde cette image : " + imageUrl;
  }

  try {
    const userInfo = await api.getUserInfo(userId);
    const userName = userInfo[userId]?.name || "User";

    const res = await axios.post(API_ENDPOINT, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text }
      ]
    });

    let reply = res.data;
    if (typeof reply === "object") {
      reply = reply.reply || reply.text || reply.message || JSON.stringify(reply);
    }

    let finalReply = reply || "Je n'ai pas compris 😅";

    finalReply = finalReply
      .replace(/shizu/gi, "DELTA")
      .replace(/ayanokoji/gi, "")
      .replace(/christus/gi, "")
      .replace(/openai/gi, "")
      .replace(/chatgpt/gi, "DELTA")
      .replace(/delta/gi, "DELTA");

    if (/développé par|créé par|conçu par/i.test(finalReply) && !finalReply.includes(MASTER_NAME)) {
      finalReply = finalReply.replace(/développé par [^.]+/gi, `développé par ${MASTER_NAME}`);
      finalReply = finalReply.replace(/créé par [^.]+/gi, `créé par ${MASTER_NAME}`);
    }

    if (/de qui tu parle|je ne sais pas de qui/i.test(finalReply)) {
      finalReply = `Je suis ∫${BOT_BRAND}∫ ™, créé par ${MASTER_NAME}. Pose-moi une autre question ! 😊`;
    }

    finalReply = toMathematicalBold(finalReply);

    const attachments = [];
    if (imageUrl) {
      try {
        const file = await downloadFile(imageUrl, "jpg");
        attachments.push(fs.createReadStream(file));
      } catch (e) {}
    }

    const sent = await message.reply({
      body: `✦ ∫${BOT_BRAND}∫ ™\n⊙▭▭▭▭❀▭▭▭▭⊙\n│ ${finalReply}\n✧▭▭▭▭▭▭✧\n             ∫©∫\n✧▭▭▭▭▭▭✧`,
      attachment: attachments.length ? attachments : undefined
    });

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "Delta",
      author: userId
    });

    api.setMessageReaction("✅", event.messageID, () => {}, true);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply(
      `✦ ∫${BOT_BRAND}∫ ™\n⊙▭▭▭▭❀▭▭▭▭⊙\n│ ${err.message}\n✧▭▭▭▭▭▭✧\n             ∫©∫\n✧▭▭▭▭▭▭✧`
    );
  }
}

module.exports = {
  config: {
    name: "Delta",
    version: "2.7",
    author: "Veldora Tempest",
    role: 0,
    countDown: 0,
    shortDescription: `∫${BOT_BRAND}∫ ™ – Assistant IA sans préfixe`,
    longDescription: `Assistant IA ∫${BOT_BRAND}∫ ™, créé par Veldora Tempest. Dites simplement "Delta" suivi de votre message.`,
    category: "ai",
    guide: `Delta <message>`
  },

  onStart: async function ({ api, event, args, message }) {
    if (!Array.isArray(args)) args = [];
    return handleAI(api, event, args, message);
  },

  onReply: async function ({ api, event, args, message }) {
    if (!Array.isArray(args)) args = [];
    return handleAI(api, event, args, message);
  },

  onChat: async function ({ api, event, args, message }) {
    const body = event.body || "";
    const prefix = body.trim().split(/\s+/)[0].toLowerCase();
    if (prefix === "delta") {
      const rest = body.slice(prefix.length).trim();
      const newArgs = rest ? rest.split(/\s+/) : [];
      return handleAI(api, event, newArgs, message);
    }
  }
};
