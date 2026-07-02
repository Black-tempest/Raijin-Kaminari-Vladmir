const os = require("os");
const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

function formatDuration(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const time = [h, m, s]
    .map(v => v.toString().padStart(2, "0"))
    .join(":");

  return d > 0 ? `${d}d ${time}` : time;
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["runtime", "status", "up", "F"],
    version: "3.0",
    author: "NeoKEX x Stack's",
    editor: "Camille Uchiha",
    countDown: 5,
    role: 4,
    longDescription: "Affiche l'uptime du bot avec un style hacker en Canvas.",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message, api, event }) {
    try {
      // --- CAPTURE DES DONNÉES SYSTÈME ---
      const uptime = formatDuration(process.uptime());

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const ramPercent = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

      const toGB = bytes => (bytes / 1024 / 1024 / 1024).toFixed(2);
      const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);

      const cpu = os.cpus()[0];
      const cpuModel = cpu.model.replace(/\s+/g, " ");
      const cpuCores = os.cpus().length;
      const cpuSpeed = cpu.speed;

      const mem = process.memoryUsage();
      const load = os.loadavg().map(v => v.toFixed(2)).join(" • ");

      const botID = global.GoatBot?.botID || "N/A";
      const commandCount = global.GoatBot?.commands?.size || 0;
      const threadCount = global.db?.allThreadData?.length || 0;
      const userCount = global.db?.allUserData?.length || 0;

      // --- ARCHITECTURE CANVAS : TERMINAL HACKER ---
      const width = 950;
      const height = 650;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Fond Noir Terminal
      ctx.fillStyle = "#05070a";
      ctx.fillRect(0, 0, width, height);

      // Lignes de code en arrière-plan (Effet Matrice discret)
      ctx.fillStyle = "rgba(16, 185, 129, 0.03)";
      ctx.font = "14px monospace";
      for (let yPosition = 30; yPosition < height; yPosition += 25) {
        ctx.fillText("01011001 01101111 01110101 00100000 01000111 01101111 01110100 00100000 01001000 01100001 01100011 01101011 01100101 01100100", 20, yPosition);
      }

      // Bordure double néon vert hacker
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
      ctx.strokeRect(15, 15, width - 30, height - 30);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(22, 22, width - 44, height - 44);

      // --- EN-TÊTE TERMINAL ---
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 28px monospace";
      ctx.fillText("[+] STACKS_OS_CORE_TERMINAL v3.0", 50, 70);

      ctx.fillStyle = "rgba(16, 185, 129, 0.6)";
      ctx.font = "16px monospace";
      ctx.fillText(`INITIALIZING INBOUND CONNECTION... STATUS: ONLINE & STABLE`, 50, 100);

      // Séparateur terminal
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, 115);
      ctx.lineTo(width - 50, 115);
      ctx.stroke();

      // --- DIVISION DES BLOCS DE DONNÉES (2 Colonnes) ---
      
      // --- COLONNE 1 (Gauche) ---
      let y = 160;
      
      // SECTION 1: UPTIME & BOT STATS
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(">_ BOT_UPTIME_METRICS", 50, y);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`• RUNTIME    :  ${uptime}`, 60, y + 30);
      ctx.fillText(`• BOT_ID     :  ${botID}`, 60, y + 55);
      ctx.fillText(`• REPO_CMDS  :  ${commandCount} loaded`, 60, y + 80);
      ctx.fillText(`• METAD_USER :  ${userCount} data records`, 60, y + 105);
      ctx.fillText(`• SERV_THRD  :  ${threadCount} channels`, 60, y + 130);

      // SECTION 2: NODE.JS & ENGINE
      y = 345;
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(">_ ENGINE_ENVIRONMENT", 50, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`• NODE_VER   :  v${process.versions.node}`, 60, y + 30);
      ctx.fillText(`• V8_ENGINE  :  ${process.versions.v8}`, 60, y + 55);
      ctx.fillText(`• NODE_PID   :  ${process.pid}`, 60, y + 80);

      // SECTION 3: VIRTUAL MEMORY (Node Heap)
      y = 480;
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(">_ ENGINE_HEAP_MEMORY", 50, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`• HEAP_USED  :  ${toMB(mem.heapUsed)} MB`, 60, y + 30);
      ctx.fillText(`• HEAP_TOTAL :  ${toMB(mem.heapTotal)} MB`, 60, y + 55);
      ctx.fillText(`• RSS_ALLOC  :  ${toMB(mem.rss)} MB`, 60, y + 80);


      // --- COLONNE 2 (Droite) ---
      y = 160;
      const col2X = 500;

      // SECTION 4: HOST SPECIFICATIONS
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(">_ HOST_SPECIFICATIONS", col2X, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      ctx.fillText(`• HOSTNAME   :  ${os.hostname()}`, col2X + 10, y + 30);
      ctx.fillText(`• OS_KERNEL  :  ${os.type()} [${os.release()}]`, col2X + 10, y + 55);
      ctx.fillText(`• ARCH_PLAT  :  ${os.platform()} (${os.arch()})`, col2X + 10, y + 80);

      // SECTION 5: HARDWARE & RESOURCE USAGE
      y = 295;
      ctx.fillStyle = "#34d399";
      ctx.font = "bold 18px monospace";
      ctx.fillText(">_ HARDWARE_RESOURCE_MONITOR", col2X, y);

      ctx.fillStyle = "#ffffff";
      ctx.font = "16px monospace";
      
      // Coupe propre du modèle CPU si trop long pour la colonne
      let displayCPU = cpuModel;
      if (ctx.measureText(displayCPU).width > 380) {
        displayCPU = displayCPU.substring(0, 35) + "...";
      }
      ctx.fillText(`• CPU_MODEL  :  ${displayCPU}`, col2X + 10, y + 30);
      ctx.fillText(`• CPU_CORES  :  ${cpuCores} Threads @ ${cpuSpeed}MHz`, col2X + 10, y + 55);
      ctx.fillText(`• LOAD_AVG   :  ${load}`, col2X + 10, y + 80);
      ctx.fillText(`• RAM_ALLO   :  ${toGB(usedMem)} / ${toGB(totalMem)} GB`, col2X + 10, y + 105);
      ctx.fillText(`• RAM_USAGE  :  ${ramPercent}%`, col2X + 10, y + 130);

      // --- BARRE DE PROGRESSION GRAPHIQUE POUR LA RAM ---
      const barX = col2X + 10;
      const barY = y + 150;
      const barWidth = 360;
      const barHeight = 16;

      // Fond de la barre
      ctx.fillStyle = "#111827";
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Remplissage dynamique de la barre
      const fillWidth = Math.max(0, Math.min(barWidth, (ramPercent / 100) * barWidth));
      ctx.fillStyle = ramPercent > 85 ? "#ef4444" : "#10b981"; // Rouge si alerte >85%, sinon vert
      ctx.fillRect(barX + 2, barY + 2, fillWidth - 4, barHeight - 4);


      // --- PIED DE PAGE TERMINAL ---
      ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, height - 75);
      ctx.lineTo(width - 50, height - 75);
      ctx.stroke();

      // Témoin d'activité
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(60, height - 50, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px monospace";
      ctx.fillText("SYSTEM STATUS: SECURE // POWERED BY STACK'S", 85, height - 45);

      // --- CACHE SYSTEM ---
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const cachePath = path.join(cacheDir, `uptime_${event.senderID}.png`);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(cachePath, buffer);

      const formMessage = {
        body: `🟢 [ STACK'S CORE METRICS ]\n• Uptime global : ${uptime}\n• Charge système : ${ramPercent}%\n📊 Structure matérielle synthétisée graphiquement ci-dessous.`,
        attachment: fs.createReadStream(cachePath)
      };

      await api.sendMessage(formMessage, event.threadID, event.messageID);

      setTimeout(() => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
      }, 8000);

    } catch (err) {
      console.error(err);
      return message.reply(`❌ Terminal Error: ${err.message}`);
    }
  }
};


