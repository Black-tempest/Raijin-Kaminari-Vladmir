const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "out",
    aliases: ["leave"],
    version: "2.0",
    author: "Christus",
    editor: "Camille Uchiha",
    countDown: 5,
    role: 3,
    shortDescription: {
      en: "Le bot génère un adieu en Canvas et quitte le groupe",
      fr: "Le bot génère un adieu en Canvas et quitte le groupe"
    },
    category: "owner",
    guide: {
      en: "{pn} — Faire quitter le bot de ce groupe"
    }
  },

  onStart: async function ({ api, event }) {
    const { threadID } = event;
    const botID = api.getCurrentUserID();

    try {
      // --- CONFIGURATION DU DESIGN CANVAS ---
      const width = 850;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Arrière-plan dégradé mélancolique style crépuscule
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#311042");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Bordure externe néon rose/violet
      ctx.strokeStyle = "#db2777";
      ctx.lineWidth = 6;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      // --- RÉCUPÉRATION ET RECADRAGE DE L'AVATAR DU BOT ---
      const avatarSize = 120;
      const avatarX = 60;
      const avatarY = (height - avatarSize) / 2;
      const centerX = avatarX + avatarSize / 2;
      const centerY = avatarY + avatarSize / 2;

      ctx.save();
      // Création du masque rond pour la photo du bot
      ctx.beginPath();
      ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
      ctx.clip();

      let botImgLoaded = false;
      const botAvatarUrl = `https://facebook.com{botID}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      try {
        const botImg = await loadImage(botAvatarUrl);
        ctx.drawImage(botImg, avatarX, avatarY, avatarSize, avatarSize);
        botImgLoaded = true;
      } catch (e) {
        botImgLoaded = false;
      }

      // Si l'avatar Facebook échoue à charger, on dessine une icône par défaut
      if (!botImgLoaded) {
        ctx.fillStyle = "#4c1d95";
        ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
        ctx.fillStyle = "#f472b6";
        ctx.font = "bold 50px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🤖", centerX, centerY + 18);
        ctx.textAlign = "left";
      }
      ctx.restore();

      // Dessin du contour néon autour de l'avatar du bot
      ctx.strokeStyle = "#f472b6";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (avatarSize / 2) + 2, 0, Math.PI * 2);
      ctx.stroke();

      // --- INJECTION DES TEXTES D'ADIEU ---
      // Titre principal
      ctx.fillStyle = "#f472b6";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText("😢 AU REVOIR...", 210, 140);

      // Message de corps
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px sans-serif";
      ctx.fillText("D'accord, je quitte ce groupe à votre demande.", 210, 200);

      // Note affectueuse de fin
      ctx.fillStyle = "#94a3b8";
      ctx.font = "italic 22px sans-serif";
      ctx.fillText("💌 Prenez bien soin de vous tous. Bye ! 💖", 210, 250);

      // --- DISK CACHE SYSTEM (Envoi blindé) ---
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const cachePath = path.join(cacheDir, `leave_${threadID}.png`);
      
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      // Configuration de la structure d'envoi Messenger
      const formMessage = {
        body: "😢 C'est l'heure des adieux... Ma carte de départ a été générée.",
        attachment: fs.createReadStream(cachePath)
      };

      // Envoi du message graphique
      await api.sendMessage(formMessage, threadID);

      // Temporisation pour laisser le temps à l'image d'être transmise aux serveurs de Facebook avant l'exclusion
      setTimeout(() => {
        // Nettoyage immédiat du fichier cache
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        // Le bot se retire de la conversation de manière autonome
        api.removeUserFromGroup(botID, threadID);
      }, 1500);

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Une erreur est survenue, impossible de quitter le groupe proprement.", threadID);
    }
  }
};


