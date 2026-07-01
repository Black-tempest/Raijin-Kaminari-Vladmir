const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "join",
    version: "4.3",
    author: "Christus",
    editor: "Camille Uchiha",
    countDown: 5,
    role: 2,
    dev: true,
    shortDescription: "Rejoindre un groupe avec catalogue visuel Canvas et contours photos personnalisés",
    longDescription: "Liste paginée graphique des groupes avec leurs photos officielles entourées d'un cercle de couleur.",
    category: "owner",
    guide: { en: "{p}{n} [page|next|prev]" },
  },

  onStart: async function ({ api, event, args }) {
    try {
      // --- CONFIGURATION DU STYLE DES AVATARS ---
      const avatarSize = 58;         // Taille de la photo de profil du groupe
      const avatarBorderSize = 3;    // Épaisseur du contour de la photo (0 pour désactiver)
      const avatarBorderColor = "#06b6d4"; // Couleur du contour (Neon Cyan)

      const groupList = await api.getThreadList(200, null, ["INBOX"]);
      const filteredList = groupList.filter(g => g.isGroup && g.isSubscribed);

      if (!filteredList.length) return api.sendMessage("❌ Aucun groupe trouvé.", event.threadID);

      const pageSize = 6; 
      const totalPages = Math.ceil(filteredList.length / pageSize);
      if (!global.joinPage) global.joinPage = {};
      const currentThread = event.threadID;

      let page = 1;
      if (args && args.length > 0) {
        const input = args.toLowerCase();
        if (input === "next") page = (global.joinPage[currentThread] || 1) + 1;
        else if (input === "prev") page = (global.joinPage[currentThread] || 1) - 1;
        else if (input.includes("/")) page = parseInt(input.split("/")) || 1;
        else page = parseInt(input) || 1;
      }

      if (page < 1) page = 1;
      if (page > totalPages) page = totalPages;
      global.joinPage[currentThread] = page;

      const startIndex = (page - 1) * pageSize;
      const currentGroups = filteredList.slice(startIndex, startIndex + pageSize);

      // --- ARCHITECTURE CANVAS GENERATION ---
      const width = 900;
      const height = 160 + (currentGroups.length * 90); 
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background Cyber Grad
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#1e1b4b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Bordure externe néon
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 6;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      // Titre principal
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 34px sans-serif";
      ctx.fillText("🤝 BOT SERVER DIRECTORY", 50, 70);

      // Sous-titre pagination
      ctx.fillStyle = "#94a3b8";
      ctx.font = "20px sans-serif";
      ctx.fillText(`Page ${page} / ${totalPages}  •  Total : ${filteredList.length} groupes disponibles`, 50, 110);

      // Séparateur
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 130);
      ctx.lineTo(width - 40, 130);
      ctx.stroke();

      // Dessin de chaque élément de groupe
      let currentY = 190;
      
      for (let i = 0; i < currentGroups.length; i++) {
        const g = currentGroups[i];
        const itemNumber = startIndex + i + 1;
        const nameText = g.threadName || "Groupe sans nom";
        const membersText = `${g.participantIDs.length} membres`;

        // Background bloc individuel étendu
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fillRect(40, currentY - 45, width - 80, 76);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(40, currentY - 45, width - 80, 76);

        // Index / Numéro de sélection
        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText(`${itemNumber}.`, 60, currentY + 3);

        // --- POSITIONNEMENT DE L'AVATAR ---
        const avatarX = 110;
        const avatarY = currentY - 35;
        const centerX = avatarX + avatarSize / 2;
        const centerY = avatarY + avatarSize / 2;

        ctx.save();
        // Création du masque circulaire pour l'image du groupe
        ctx.beginPath();
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();

        let imgLoaded = false;
        if (g.imageSrc) {
          try {
            const groupImg = await loadImage(g.imageSrc);
            ctx.drawImage(groupImg, avatarX, avatarY, avatarSize, avatarSize);
            imgLoaded = true;
          } catch (e) {
            imgLoaded = false;
          }
        }

        if (!imgLoaded) {
          ctx.fillStyle = "#334155";
          ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("👥", centerX, centerY + 8);
          ctx.textAlign = "left"; 
        }
        ctx.restore();

        // --- OPTION : DESSIN DU CERCLE DE CONTOUR DE COULEUR ---
        if (avatarBorderSize > 0) {
          ctx.save();
          ctx.strokeStyle = avatarBorderColor;
          ctx.lineWidth = avatarBorderSize;
          ctx.beginPath();
          // Le rayon inclut la moitié de l'épaisseur du trait pour ne pas déborder
          ctx.arc(centerX, centerY, (avatarSize / 2) + (avatarBorderSize / 2), 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Nom du groupe (Ajusté en fonction du nouvel espace de l'avatar)
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px sans-serif";
        let displayTitle = nameText;
        const maxTextWidth = 420; 
        
        if (ctx.measureText(displayTitle).width > maxTextWidth) {
          while (ctx.measureText(displayTitle + "...").width > maxTextWidth) {
            displayTitle = displayTitle.slice(0, -1);
          }
          displayTitle += "...";
        }
        ctx.fillText(displayTitle, 195, currentY + 3);

        // Compteur de membres aligné à droite
        ctx.fillStyle = "#10b981";
        ctx.font = "20px sans-serif";
        ctx.fillText(`👥 ${membersText}`, width - 230, currentY + 3);

        currentY += 90;
      }

      // --- DISK CACHE SYSTEM ---
      const cachePath = path.join(__dirname, "cache", `join_${event.senderID}.png`);
      fs.ensureDirSync(path.dirname(cachePath));
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      const formMessage = {
        body: "✉️ [ CATALOGUE DES GROUPES ]\n👉 Répondez à ce message avec le NUMÉRO du groupe pour le rejoindre.\n💡 Exemple: 3",
        attachment: fs.createReadStream(cachePath)
      };

      const sentMessage = await api.sendMessage(formMessage, event.threadID);
      
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID,
        list: filteredList,
        page,
        pageSize,
        cachePath
      });

      setTimeout(() => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, 10000);

    } catch (e) {
      console.error(e);
      api.sendMessage("⚠️ Erreur lors de la génération visuelle du catalogue des groupes.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    const { author, list, page, pageSize, cachePath } = Reply;
    if (event.senderID !== author) return;

    if (cachePath && fs.existsSync(cachePath)) {
      try { fs.unlinkSync(cachePath); } catch(e){}
    }

    const groupIndex = parseInt(args, 10);
    if (isNaN(groupIndex) || groupIndex <= 0) {
      return api.sendMessage("⚠️ Numéro invalide. Répondez avec un numéro de groupe valide.", event.threadID, event.messageID);
    }

    const selected = list[groupIndex - 1];
    if (!selected) {
      return api.sendMessage("⚠️ Ce numéro n'existe pas dans le répertoire global.", event.threadID, event.messageID);
    }

    try {
      const groupID = selected.threadID;
      const members = await api.getThreadInfo(groupID);

      if (members.participantIDs.includes(event.senderID)) {
        return api.sendMessage(`⚠️ Vous êtes déjà membre de 『${selected.threadName || "Groupe sans nom"}』`, event.threadID, event.messageID);
      }
      if (members.participantIDs.length >= 250) {
        return api.sendMessage(`🚫 Impossible de rejoindre : 『${selected.threadName || "Groupe sans nom"}』 est complet (Limite: 250 membres).`, event.threadID, event.messageID);
      }

      await api.addUserToGroup(event.senderID, groupID);
      return api.sendMessage(`✅ Action réussie ! Vous avez été ajouté au groupe 『${selected.threadName || "Groupe sans nom"}』.`, event.threadID, event.messageID);

    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ Impossible de vous ajouter automatiquement. Vérifiez que le bot est toujours administrateur dans ce groupe.", event.threadID, event.messageID);
    }
  }
};


