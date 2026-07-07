const os = require("os");
const { getTime } = global.utils;

function formatDuration(seconds) {
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	const time = [h, m, s].map(v => v.toString().padStart(2, "0")).join(":");
	return d > 0 ? `${d}j ${time}` : time;
}

function createBar(percent, size = 20) {
	const filled = Math.round((percent / 100) * size);
	const empty = size - filled;
	const bar = "█".repeat(filled) + "░".repeat(empty);
	const color = percent > 85 ? "🔴" : percent > 60 ? "🟡" : "🟢";
	return `${color} [${bar}] ${percent}%`;
}

module.exports = {
	config: {
		name: "uptime",
		aliases: ["runtime", "status", "up", "F"],
	version: "3.1",
	author: "NeoKEX x Stack's",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
	role: 4,
		longDescription: "Affiche l'uptime et les stats du bot en mode terminal hacker.",
		category: "system",
	guide: {
			en: "{pn}",
			fr: "{pn}"
		}
	},

	onStart: async function ({ message, api, event }) {
		try {
			// --- CAPTURE DES DONNÉES SYSTÈME ---
			const uptime = formatDuration(process.uptime());
			const botUptime = formatDuration(Date.now() / 1000 - global.GoatBot.startTime);

			const totalMem = os.totalmem();
			const freeMem = os.freemem();
			const usedMem = totalMem - freeMem;
			const ramPercent = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

			const toGB = bytes => (bytes / 1024 / 1024 / 1024).toFixed(2);
			const toMB = bytes => (bytes / 1024 / 1024).toFixed(2);

			const cpu = os.cpus()[0];
			const cpuModel = cpu.model;
			const cpuCores = os.cpus().length;
			const cpuSpeed = cpu.speed;

			const mem = process.memoryUsage();
			const load = os.loadavg().map(v => v.toFixed(2)).join(" • ");

			const botID = global.GoatBot?.botID || "N/A";
			const commandCount = global.GoatBot?.commands?.size || 0;
			const threadCount = global.db?.allThreadData?.length || 0;
			const userCount = global.db?.allUserData?.length || 0;

			// --- MESSAGE TERMINAL HACKER ---
			const msg = 
`🍓━━━━━━━━🍓
[+]_STACKS_OS_CORE_TERMINAL_v3.1
STATUT: 🟢 ONLINE & STABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

> BOT_UPTIME_METRICS
• RUNTIME    : ${uptime}
• BOT_UPTIME : ${botUptime}
• BOT_ID     : ${botID}
• CMDS_LOAD  : ${commandCount} commandes
• USERS_DB   : ${userCount} utilisateurs
• THREADS_DB : ${threadCount} groupes

> ENGINE_ENVIRONMENT
• NODE_VER   : v${process.versions.node}
• V8_ENGINE  : ${process.versions.v8}
• NODE_PID   : ${process.pid}
• HEAP_USED  : ${toMB(mem.heapUsed)} MB
• HEAP_TOTAL : ${toMB(mem.heapTotal)} MB
• RSS_ALLOC  : ${toMB(mem.rss)} MB

> HOST_SPECIFICATIONS
• HOSTNAME   : ${os.hostname()}
• OS_KERNEL  : ${os.type()} [${os.release()}]
• ARCH_PLAT  : ${os.platform()} (${os.arch()})

> HARDWARE_RESOURCE_MONITOR
• CPU_MODEL  : ${cpuModel}
• CPU_CORES  : ${cpuCores} Cores @ ${cpuSpeed}MHz
• LOAD_AVG   : ${load}
• RAM_USED   : ${toGB(usedMem)} / ${toGB(totalMem)} GB
• RAM_USAGE  : ${createBar(ramPercent)}

━━━━━━━━━━━
🍓 SYSTEM STATUS: SECURE
POWERED BY STACK'S 🍓`;

			return message.reply(msg);

	} catch (err) {
			console.error(err);
			return message.reply(`🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥 𝗧𝗘𝗥𝗠𝗜𝗡𝗔𝗟\n${err.message}\n🍓━━━━━━━━🍓`);
		}
	}
};
