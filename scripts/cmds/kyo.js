const axios = require("axios");

const API_URL = "https://uraryanapi.onrender.com/api/gpt-3.5-turbo";
const CREATOR_ID = "61587455871434";
const maxStorageMessage = 4;

// ================= TEMP =================
if (!global.temp.openAIUsing)
  global.temp.openAIUsing = {};

if (!global.temp.openAIHistory)
  global.temp.openAIHistory = {};

const { openAIUsing, openAIHistory } = global.temp;

// ================= API =================
async function askKyo(event, prompt) {
  try {
    const fullPrompt =
      "Tu es Kyo Soma.\n" +
      "- Tu es humain, froid, sarcastique\n" +
      "- Tu réponds uniquement en français\n" +
      "- Tu évites les réponses robotiques\n\n" +
      prompt;

    const res = await axios.get(
      `${API_URL}?prompt=${encodeURIComponent(fullPrompt)}&uid=${event.senderID}`,
      { timeout: 15000 }
    );

    let reply =
      res.data?.message ||
      res.data?.response ||
      res.data?.reply ||
      res.data?.result ||
      "";

    if (!reply || typeof reply !== "string") {
      reply = "…Tch, j’ai rien reçu.";
    }

    if (event.senderID === CREATOR_ID) {
      reply = "⚡ " + reply;
    }

    return reply;

  } catch (err) {
    console.error("API Error:", err.message);
    return "😾 Serveur indisponible.";
  }
}

// ================= MODULE =================
module.exports = {
  config: {
    name: "kyo",
    version: "6.0",
    author: "Camille",
    countDown: 5,
    role: 0,
    category: "AI",
    shortDescription: "Kyo Soma IA avec mémoire",
  },

  // ===== START =====
  onStart: async function ({ message, event, args }) {
    if (args[0] === "clear") {
      openAIHistory[event.senderID] = [];
      return message.reply("🧹 Mémoire effacée.");
    }

    if (!args[0]) {
      return message.reply("😾 Parle.");
    }

    handleKyo(event, message, args, this.config.name);
  },

  // ===== REPLY =====
  onReply: async function ({ Reply, message, event, args }) {
    if (Reply.author !== event.senderID) return;

    handleKyo(event, message, args, this.config.name);
  }
};

// ================= LOGIQUE =================
async function handleKyo(event, message, args, commandName) {
  try {
    if (openAIUsing[event.senderID]) {
      return message.reply("⏳ Attends un peu.");
    }

    openAIUsing[event.senderID] = true;

    if (!Array.isArray(openAIHistory[event.senderID])) {
      openAIHistory[event.senderID] = [];
    }

    // limite mémoire
    if (openAIHistory[event.senderID].length >= maxStorageMessage) {
      openAIHistory[event.senderID].shift();
    }

    const userMsg = args.join(" ");
    openAIHistory[event.senderID].push("User: " + userMsg);

    const historyText = openAIHistory[event.senderID].join("\n");

    const reply = await askKyo(event, historyText);

    openAIHistory[event.senderID].push("Kyo: " + reply);

    return message.reply("😾 Kyo Soma :\n\n" + reply, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID
      });
    });

  } catch (err) {
    return message.reply("❌ Erreur.");
  } finally {
    delete openAIUsing[event.senderID];
  }
                                              }
