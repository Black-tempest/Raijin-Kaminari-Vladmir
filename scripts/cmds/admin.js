// ===== FIX ERREUR clearLine =====
if (!process.stderr.clearLine) {
  process.stderr.clearLine = () => {};
  process.stderr.cursorTo = () => {};
  process.stderr.moveCursor = () => {};
}

const { writeFileSync, ensureDirSync, createReadStream, unlinkSync } = require("fs-extra");
const path = require("path");
const axios = require("axios");
const GIFEncoder = require("gifencoder");

const CACHE_DIR = path.join(__dirname, "cache");
ensureDirSync(CACHE_DIR);

const NARUTO_BACKGROUND_GIF = "https://i.ibb.co/LDqZRbT0/a27425103d65.gif";

// Télécharge image et retourne buffer
async function fetchBuffer(url) {
  try {
    const res = await axios.get(url, { 
      responseType: "arraybuffer", 
      timeout: 15000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    return Buffer.from(res.data);
  } catch (e) {
    return null;
  }
}

// Récupère photo FB avec 3 fallbacks garantis
async function getAvatar(uid, name) {
  // Méthode 1: Graph API avec token public
  try {
    const url1 = `https://graph.facebook.com/${uid}/picture?width=200&height=200&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const buf1 = await fetchBuffer(url1);
    if (buf1 && buf1.length > 8000) return buf1;
  } catch (e) {}

  // Méthode 2: API redirect=false
  try {
    const apiRes = await axios.get(`https://graph.facebook.com/v18.0/${uid}/picture?width=200&height=200&redirect=false`);
    if (apiRes.data && apiRes.data && apiRes.data.url) {
      const buf2 = await fetchBuffer(apiRes.data.url);
      if (buf2 && buf2.length > 8000) return buf2;
    }
  } catch (e) {}

  // Méthode 3: ui-avatars garanti avec couleur orange Shippuden
  const cleanName = encodeURIComponent(name || "Shinobi");
  const fallbackUrl = `https://ui-avatars.com/api/?name=${cleanName}&background=ff4500&color=ffffff&size=200&rounded=true&bold=true&length=2`;
  return await fetchBuffer(fallbackUrl);
}

// GIF pour add/remove
async function generateActionGif(type, uid, name) {
  const { createCanvas, loadImage } = require("canvas");

  const W = 800, H = 450;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(W, H);
  const outPath = path.join(CACHE_DIR, `admin_${type}_${Date.now()}.gif`);
  encoder.createReadStream().pipe(require("fs").createWriteStream(outPath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(100);
  encoder.setQuality(12);

  const avatarBuf = await getAvatar(uid, name);
  const avatarImg = avatarBuf? await loadImage(avatarBuf) : null;

  let backgroundFrame = null;
  try {
    const gifBuffer = await fetchBuffer(NARUTO_BACKGROUND_GIF);
    if (gifBuffer) backgroundFrame = await loadImage(gifBuffer);
  } catch (e) {}

  const isAdd = type === "add";
  const mainText = isAdd? "NOMINATION AU CONSEIL" : "DESTITUTION DU CONSEIL";
  const subText = isAdd? "Le feu de la volonté s'allume!" : "La volonté du feu se transmet...";
  const color = isAdd? "#ffaa00" : "#ff4444";

  for (let frameIndex = 0; frameIndex < 10; frameIndex++) {
    ctx.clearRect(0, 0, W, H);

    if (backgroundFrame) {
      ctx.drawImage(backgroundFrame, 0, -(frameIndex * 3), W, H + 30);
    } else {
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, W, H);

    // Filigrane KAGE/SHINOBI
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = color;
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i < 3; i++) {
      ctx.save();
      let x = W/2 + Math.cos(frameIndex * 0.4 + i) * 180;
      let y = H/2 + Math.sin(frameIndex * 0.4 + i) * 120;
      ctx.translate(x, y);
      ctx.rotate((frameIndex * 0.15 + i) * 0.3);
      ctx.fillText(isAdd? "KAGE" : "SHINOBI", 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Titre
    ctx.fillStyle = color;
    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillText(mainText, W/2, 80);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 18px Arial";
    ctx.fillText(subText, W/2, 110);

    // PHOTO GRANDE 70px rayon
    const avatarX = W/2;
    const avatarY = 220;
    const avatarRadius = 70;

    if (avatarImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();
    }

    // Bordure glow
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowColor = color;
    ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Nom
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 6;
    ctx.fillText(name, avatarX, avatarY + 110);
    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    ctx.font = "16px monospace";
    ctx.fillText(`ID: ${uid}`, avatarX, avatarY + 135);

    // Effets
    if (isAdd) {
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        let x1 = avatarX - 100 + i * 40;
        let y1 = avatarY - 80 + Math.sin(frameIndex * 0.5 + i) * 20;
        let x2 = x1 + 20;
        let y2 = y1 - 30;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
      for (let i = 0; i < 8; i++) {
        let x = avatarX + Math.cos(frameIndex * 0.3 + i) * (50 + i * 5);
        let y = avatarY + Math.sin(frameIndex * 0.3 + i) * (50 + i * 5);
        ctx.beginPath();
        ctx.arc(x, y, 15 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise(resolve => setTimeout(resolve, 600));
  return outPath;
}

// GIF pour list
async function generateAdminAnimatedGif(title, description, adminList, usersData) {
  const { createCanvas, loadImage } = require("canvas");

  const W = 900, H = 500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const encoder = new GIFEncoder(W, H);
  const outPath = path.join(CACHE_DIR, `admin_animated_${Date.now()}.gif`);
  encoder.createReadStream().pipe(require("fs").createWriteStream(outPath));

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(120);
  encoder.setQuality(12);

  const adminData = [];

  for (const uid of adminList.slice(0, 8)) {
    let profileName = "Shinobi";
    try {
      const fetchedName = await usersData.getName(uid);
      if (fetchedName) profileName = fetchedName;
    } catch (err) {}

    const avatarBuf = await getAvatar(uid, profileName);
    const avatarImg = avatarBuf? await loadImage(avatarBuf) : null;
    adminData.push({ uid, name: profileName, avatar: avatarImg });
  }

  let backgroundFrame = null;
  try {
    const gifBuffer = await fetchBuffer(NARUTO_BACKGROUND_GIF);
    if (gifBuffer) backgroundFrame = await loadImage(gifBuffer);
  } catch (e) {}

  const watermarkTexts = ["NINJA WAY", "VOLONTÉ DU FEU", "SHINOBI", "KAGE"];

  for (let frameIndex = 0; frameIndex < 8; frameIndex++) {
    ctx.clearRect(0, 0, W, H);

    if (backgroundFrame) {
      ctx.drawImage(backgroundFrame, 0, -(frameIndex * 2), W, H + 20);
    } else {
      ctx.fillStyle = "#0f1117";
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, W, H);

    // Filigrane
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    for (let i = 0; i < watermarkTexts.length; i++) {
      ctx.save();
      let x = W/2 + Math.cos(frameIndex * 0.3 + i) * 200;
      let y = H/2 + Math.sin(frameIndex * 0.3 + i) * 150;
      let angle = (frameIndex * 0.1 + i) * 0.5;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(watermarkTexts[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ff4500";
    ctx.shadowBlur = 15;
    ctx.fillText(title, W/2, 70);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#cccccc";
    ctx.font = "16px Arial";
    ctx.fillText(description, W/2, 95);

    let startX = 110;
    let startY = 170;
    let cols = 4;
    let spacingX = 180;
    let spacingY = 155;

    for (let i = 0; i < adminData.length; i++) {
      const { uid, name, avatar } = adminData[i];
      let col = i % cols;
      let row = Math.floor(i / cols);
      let x = startX + col * spacingX;
      let y = startY + row * spacingY;

      const avatarX = x;
      const avatarY = y;
      const avatarRadius = 30;

      // PHOTO PETITE 30px - maintenant elle s'affiche
      if (avatar) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffaa00";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#ff4500";
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px Arial";
      ctx.textAlign = "center";
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 4;
      ctx.fillText(name, avatarX, y + 55);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffaa00";
      ctx.font = "11px monospace";
      ctx.fillText(uid, avatarX, y + 70);
    }

    ctx.fillStyle = "rgba(255, 170, 0, 0.6)";
    ctx.font = "10px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Conseil des Kage - Système Shippuden", W - 20, H - 15);

    encoder.addFrame(ctx);
  }

  encoder.finish();
  await new Promise(resolve => setTimeout(resolve, 600));
  return outPath;
}

module.exports = {
  config: {
    name: "admin",
    version: "3.7",
    author: "NTKhang",
    editeur:"Camille",
    countDown: 5,
    role: 2,
    description: { en: "Gestion admins avec photos garanties" },
    category: "box chat",
    guide: { en: "{pn} add <uid> | {pn} remove <uid> | {pn} list" }
  },

  onStart: async function ({ message, args, usersData }) {
    const action = args[0]?.toLowerCase();

    switch (action) {
      case "add":
      case "-a": {
        if (!args[1]) return message.reply("🍃 ID manquant, jeune ninja!");
        let uid = args[1];
        if (isNaN(uid)) return message.reply("⚡ ID invalide!");

        if (global.GoatBot.config.adminBot.includes(uid)) {
          return message.reply("🍥 Il fait déjà partie du Conseil des Kage!");
        }

        global.GoatBot.config.adminBot.push(uid);
        writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));

        let name = await usersData.getName(uid).catch(() => "Shinobi");

        try {
          await message.reply("⚙️ Cérémonie de nomination en cours...");
          const gifPath = await generateActionGif("add", uid, name);
          return message.reply({
            body: `🔥 ${name} vient d'être nommé au Conseil des Kage!`,
            attachment: createReadStream(gifPath)
          }, () => { try { unlinkSync(gifPath); } catch(e) {} });
        } catch (err) {
          return message.reply(`🔥 ${name} nommé au Conseil des Kage!`);
        }
      }

      case "remove":
      case "-r": {
        if (!args[1]) return message.reply("🍃 ID manquant!");
        let uid = args[1];
        if (isNaN(uid)) return message.reply("⚡ ID invalide!");

        let index = global.GoatBot.config.adminBot.indexOf(uid);
        if (index === -1) {
          return message.reply("❌ Shinobi non trouvé dans le Conseil.");
        }

        let name = await usersData.getName(uid).catch(() => "Shinobi");
        global.GoatBot.config.adminBot.splice(index, 1);
        writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));

        try {
          await message.reply("⚙️ Rituel de destitution en cours...");
          const gifPath = await generateActionGif("remove", uid, name);
          return message.reply({
            body: `💨 ${name} a été relevé de ses fonctions.`,
            attachment: createReadStream(gifPath)
          }, () => { try { unlinkSync(gifPath); } catch(e) {} });
        } catch (err) {
          return message.reply(`💨 ${name} relevé de ses fonctions.`);
        }
      }

      case "list":
      case "-l": {
        try {
          await message.reply("⚙️ Déploiement du parchemin des Kage...");

          const gifPath = await generateAdminAnimatedGif(
            "CONSEIL DES KAGE",
            "Shinobi Administrateurs",
            global.GoatBot.config.adminBot,
            usersData
          );

          return message.reply({
            body: `🍃 **Parchemin des Administrateurs**`,
            attachment: createReadStream(gifPath)
          }, () => { try { unlinkSync(gifPath); } catch(e) {} });
        } catch (err) {
          console.error("Erreur GIF:", err);
          return message.reply("❌ L'invocation a échoué: " + err.message);
        }
      }

      default:
        return message.reply(
`🍃 **Jutsu du Conseil des Kage** 🍃
!admin add <uid> → Nommer un Kage
!admin remove <uid> → Destituer un Kage
!admin list → Parchemin du Conseil`
        );
    }
  }
};
