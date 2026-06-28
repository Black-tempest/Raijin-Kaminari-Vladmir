const { commands, aliases } = global.GoatBot;
const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");

// Tes 7 liens images 225
const IMAGES = [
  "https://i.ibb.co/Vcs9dpFj/cb5df098763a.gif",
  "https://i.ibb.co/N6ZHKhVg/a4ac47068586.gif",
  "https://i.ibb.co/Dfz5dLHn/b3a36e215750.jpg",
  "https://i.ibb.co/4nP2JZK7/d35b5f3b76a2.gif",
  "https://i.ibb.co/Y4dh35Mh/4c78fe2b7b0d.gif",
  "https://i.ibb.co/yTMnJP8/4278998b0421.gif",
  "https://i.ibb.co/dsrvQbKS/45a1aa31f9c8.gif"
];

async function getRandomImage() {
  const url = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  const tmpPath = path.join(__dirname, "..", "cache", `help_${Date.now()}.gif`);
  await fs.ensureDir(path.dirname(tmpPath));
  const response = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(tmpPath, response.data);
  return fs.createReadStream(tmpPath);
}

function toCmdFont(text = "") {
  const map = {
    A:"𝖠",B:"𝖡",C:"𝖢",D:"𝖣",E:"𝖤",F:"𝖥",G:"𝖦",H:"𝖧",I:"𝖨",J:"𝖩",
    K:"𝖪",L:"𝖫",M:"𝖬",N:"𝖭",O:"𝖮",P:"𝖯",Q:"𝖰",R:"𝖱",S:"𝖲",T:"𝖳",
    U:"𝖴",V:"𝖵",W:"𝖶",X:"𝖷",Y:"𝖸",Z:"𝖹",
    a:"𝖺",b:"𝖻",c:"𝖼",d:"𝖽",e:"𝖾",f:"𝖿",g:"𝗀",h:"𝗁",i:"𝗂",j:"𝗃",
    k:"𝗄",l:"𝗅",m:"𝗆",n:"𝗇",o:"𝗈",p:"𝗉",q:"𝗊",r:"𝗋",s:"𝗌",t:"𝗍",
    u:"𝗎",v:"𝗏",w:"𝗐",x:"𝗑",y:"𝗒",z:"𝗓",
    " ":" "
  };
  return text.split("").map(c => map[c] || c).join("");
}

function toQuestionFont(text = "") {
  const map = {
    A:"𝐴",B:"𝐵",C:"𝐶",D:"𝐷",E:"𝐸",F:"𝐹",G:"𝐺",H:"𝐻",I:"𝐼",J:"𝐽",
    K:"𝐾",L:"𝐿",M:"𝑀",N:"𝑁",O:"𝑂",P:"𝑃",Q:"𝑄",R:"𝑅",S:"𝑆",T:"𝑇",
    U:"𝑈",V:"𝑉",W:"𝑊",X:"𝑋",Y:"𝑌",Z:"𝑍",
    a:"𝑎",b:"𝑏",c:"𝑐",d:"𝑑",e:"𝑒",f:"𝑓",g:"𝑔",h:"ℎ",i:"𝑖",j:"𝑗",
    k:"𝑘",l:"𝑙",m:"𝑚",n:"𝑛",o:"𝑜",p:"𝑝",q:"𝑞",r:"𝑟",s:"𝑠",t:"𝑡",
    u:"𝑢",v:"𝑣",w:"𝑤",x:"𝑥",y:"𝑦",z:"𝑧",
    " ":" "
  };
  return text.split("").map(c => map[c] || c).join("");
}

module.exports = {
  config: {
    name: "help",
    version: "6.5",
    author: "Christus", // Pas touché
    editor: "Camille Uchiha", // Ajouté
    countDown: 2,
    role: 0,
    shortDescription: { en: "Explore all bot commands" },
    category: "info",
    guide: { en: "help <command>" }, // -ai supprimé
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      const uid = event.senderID;
      const attachment = await getRandomImage(); // Image random

      let avatarStream;
      try {
        const avatarUrl = await usersData.getAvatarUrl(uid);
        avatarStream = await global.utils.getStreamFromURL(avatarUrl);
      } catch {
        avatarStream = await global.utils.getStreamFromURL(
          `https://graph.facebook.com/${uid}/picture?width=720&height=720`
        );
      }

      // BLOC -AI SUPPRIMÉ ✅

      if (!args || args.length === 0) {
        let body = "📚 GOAT BOT COMMANDS\n";

        const categories = {};
        for (const [name, command] of commands) {
          const category = command.config.category || "Misc";
          if (!categories[category]) categories[category] = [];
          categories[category].push(name);
        }

        for (const [category, cmds] of Object.entries(categories)) {
          body += `\n[${toCmdFont(category)}]\n`;
          body += cmds.map(c => `• ${toCmdFont(c)}`).join("\n") + "\n";
        }

        body += `\nTotal: ${commands.size} commandes\n`;
        body += `Page 1/${Math.ceil(commands.size/20)}`;

        return message.reply({
          body: body.trim(),
          attachment // Image random ici
        });
      }

      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply({
          body: `❌ Command "${commandName}" not found.`,
          attachment // Image random ici aussi
        });
      }

      const cfg = command.config;
      const body = `

📝 Description: ${cfg.longDescription?.en || cfg.shortDescription?.en || "No description"}
📁 Category: ${cfg.category || "Misc"}
🔖 Aliases: ${Array.isArray(cfg.aliases)? cfg.aliases.join(", ") : "None"}
👑 Author: ${cfg.author}
✏️ Editor: ${cfg.editor || "None"}
🔢 Version: ${cfg.version}
⏰ Cooldown: ${cfg.countDown}s
👤 Role: ${cfg.role}
📖 Guide: ${cfg.guide?.en || "No guide"}
      `.trim();

      return message.reply({
        body,
        attachment // Image random ici aussi
      });

    } catch (e) {
      console.log(e);
    }
  }
};
