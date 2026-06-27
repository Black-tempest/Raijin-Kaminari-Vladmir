const os = require("os");

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

function progressBar(percent, length = 12) {
  const filled = Math.round((percent / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["runtime", "status", "up", "F"],
    version: "2.0",
    author: "NeoKEX x Stack's",
    countDown: 5,
    role: 4,
    longDescription: "Affiche l'uptime du bot avec un style premium.",
    category: "system",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    // Uptime
    const uptime = formatDuration(process.uptime());

    // System Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercent = ((usedMem / totalMem) * 100).toFixed(1);

    // Conversion
    const toGB = bytes => (bytes / 1024 / 1024 / 1024).toFixed(2);
    const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);

    // CPU Info
    const cpu = os.cpus()[0];
    const cpuModel = cpu.model.replace(/\s+/g, " ");
    const cpuCores = os.cpus().length;
    const cpuSpeed = cpu.speed;

    // Node Memory
    const mem = process.memoryUsage();

    // Load Average
    const load = os.loadavg().map(v => v.toFixed(2)).join(" • ");

    // Bot Stats
    const botID = global.GoatBot?.botID || "N/A";
    const commandCount = global.GoatBot?.commands?.size || 0;
    const threadCount = global.db?.allThreadData?.length || 0;
    const userCount = global.db?.allUserData?.length || 0;

    // Progress Bar
    const ramBar = progressBar(ramPercent);

    // Message
    const msg = `
╔══════════════════════╗
      ⚡ 𝗦𝗧𝗔𝗖𝗞'𝗦 𝗨𝗣𝗧𝗜𝗠𝗘 ⚡
╚══════════════════════╝

⏳ 𝗨𝗽𝘁𝗶𝗺𝗲
┌───────────────────
│ ⏱️ ${uptime}
│ 🤖 ID: ${botID}
│ 📦 Cmds: ${commandCount}
│ 👥 Users: ${userCount}
│ 💬 Threads: ${threadCount}
└───────────────────

🧠 𝗡𝗼𝗱𝗲.𝗷𝘀
┌───────────────────
│ 🟢 Node: v${process.versions.node}
│ ⚙️ V8: ${process.versions.v8}
│ 🆔 PID: ${process.pid}
└───────────────────

💾 𝗕𝗼𝘁 𝗠𝗲𝗺𝗼𝗿𝘆
┌───────────────────
│ Heap Used : ${toMB(mem.heapUsed)} MB
│ Heap Total: ${toMB(mem.heapTotal)} MB
│ RSS       : ${toMB(mem.rss)} MB
└───────────────────

🖥️ 𝗦𝘆𝘀𝘁𝗲𝗺
┌───────────────────
│ 🏷️ ${os.hostname()}
│ 🐧 ${os.type()} ${os.release()}
│ 🏗️ ${os.platform()} (${os.arch()})
└───────────────────

🔥 𝗛𝗮𝗿𝗱𝘄𝗮𝗿𝗲
┌───────────────────
│ 🧠 CPU: ${cpuModel}
│ ⚡ ${cpuCores} Cores @ ${cpuSpeed} MHz
│ 💾 RAM: ${toGB(usedMem)} / ${toGB(totalMem)} GB
│ 📊 ${ramPercent}% [${ramBar}]
│ 🌡️ Load: ${load}
└───────────────────

🚀 𝗦𝘁𝗮𝘁𝘂𝘀: ONLINE & STABLE
⚔️ Powered by Stack's
`;

    return message.reply(msg);
  }
};
