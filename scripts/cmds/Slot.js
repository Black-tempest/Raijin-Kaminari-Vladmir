module.exports = {
  config: {
    name: "slot",
    version: "7.4",
    author: "Veldora Tempest",
    countDown: 5,
    role: 0,
    category: "game",
    description: "🎰 Machine à sous avec animation fluide",
    usage: "slot <montant> (ex: 50, 1k, 1m, all)"
  },
  onStart: async function ({ event, api, usersData, args }) {
    const { threadID, messageID, senderID } = event;
    const userData = await usersData.get(senderID);
    let money = userData.money;

    const bold = (text) => {
      const map = {
        A: "𝐀", B: "𝐁", C: "𝐂", D: "𝐃", E: "𝐄", F: "𝐅", G: "𝐆", H: "𝐇", I: "𝐈", J: "𝐉",
        K: "𝐊", L: "𝐋", M: "𝐌", N: "𝐍", O: "𝐎", P: "𝐏", Q: "𝐐", R: "𝐑", S: "𝐒", T: "𝐓",
        U: "𝐔", V: "𝐕", W: "𝐖", X: "𝐗", Y: "𝐘", Z: "𝐙",
        a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢", j: "𝐣",
        k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫", s: "𝐬", t: "𝐭",
        u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳",
        "0": "𝟎", "1": "𝟏", "2": "𝟐", "3": "𝟑", "4": "𝟒", "5": "𝟓", "6": "𝟔", "7": "𝟕", "8": "𝟖", "9": "𝟗",
        ".": ".", "+": "+", "-": "-"
      };
      return text.toString().split('').map(c => map[c] || c).join('');
    };

    const formatMoney = (num) => {
      if (Math.abs(num) >= 1e12) return (Math.abs(num) / 1e12).toFixed(2) + "T";
      if (Math.abs(num) >= 1e9) return (Math.abs(num) / 1e9).toFixed(2) + "B";
      if (Math.abs(num) >= 1e6) return (Math.abs(num) / 1e6).toFixed(2) + "M";
      if (Math.abs(num) >= 1e3) return (Math.abs(num) / 1e3).toFixed(2) + "K";
      return Math.abs(num).toFixed(0);
    };

    const parseBet = (input) => {
      if (!input) return 0;
      const str = input.toLowerCase();
      if (str === 'all' || str === 'max') return money;
      let val = parseFloat(str);
      if (isNaN(val)) return 0;
      if (str.includes('t')) return val * 1e12;
      if (str.includes('b')) return val * 1e9;
      if (str.includes('m')) return val * 1e6;
      if (str.includes('k')) return val * 1e3;
      return val;
    };

    const bet = parseBet(args[0]);

    if (bet < 50) return api.sendMessage(`⚠️ ${bold("minimum bet is 50 coins")}`, threadID, messageID);
    if (isNaN(bet)) return api.sendMessage(`⚠️ ${bold("invalid amount.")}`, threadID, messageID);
    if (money < bet) return api.sendMessage(`💳 ${bold("insufficient funds.")}\n${bold("you have: " + formatMoney(money))}`, threadID, messageID);

    await usersData.set(senderID, { money: money - bet });

    const allSymbols = ["🍒", "🍋", "🍊", "🍇", "🍉", "🍓"];
    const getRandomSymbol = () => allSymbols[Math.floor(Math.random() * allSymbols.length)];

    let s1, s2, s3;
    const chance = Math.random();

    if (chance < 0.15) {
      const sym = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      s1 = s2 = s3 = sym;
    } else if (chance < 0.55) {
      s1 = s2 = allSymbols[Math.floor(Math.random() * allSymbols.length)];
      s3 = allSymbols.filter(s => s !== s1)[Math.floor(Math.random() * (allSymbols.length - 1))];
    } else {
      const shuffled = [...allSymbols].sort(() => 0.5 - Math.random());
      [s1, s2, s3] = [shuffled[0], shuffled[1], shuffled[2]];
    }

    let winnings = 0;
    let statusText = "🦖 LOSS";

    if (s1 === s2 && s2 === s3) {
      winnings = bet * 15;
      statusText = "💎 JACKPOT";
    } else if (s1 === s2 || s1 === s3 || s2 === s3) {
      winnings = bet * 3;
      statusText = "✨ WIN";
    }

    const finalBalance = (money - bet) + winnings;
    await usersData.set(senderID, { money: finalBalance });

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let animMsg = await api.sendMessage(
      `   ◢ SLOTS MACHINE ◣\n╭───────────────╮\n│    🔄  │  🔄  │  🔄  │\n╰───────────────╯\n◈ ${bold("STATUS")}: ${bold("SPINNING...")}`,
      threadID,
      messageID
    );

    await delay(1500);

    try {
      await api.editMessage(
        `   ◢ SLOTS MACHINE ◣\n╭───────────────╮\n│    ${s1}  │  ${getRandomSymbol()}  │  ${getRandomSymbol()}  │\n╰───────────────╯\n◈ ${bold("STATUS")}: ${bold("SPINNING...")}`,
        animMsg.messageID
      );
    } catch (e) {}

    await delay(1500);

    try {
      await api.editMessage(
        `   ◢ SLOTS MACHINE ◣\n╭───────────────╮\n│    ${s1}  │  ${s2}  │  ${getRandomSymbol()}  │\n╰───────────────╯\n◈ ${bold("STATUS")}: ${bold("SPINNING...")}`,
        animMsg.messageID
      );
    } catch (e) {}

    await delay(1500);

    try {
      await api.editMessage(
        `   ◢ SLOTS MACHINE ◣\n╭───────────────╮\n│    ${s1}  │  ${s2}  │  ${s3}  │\n╰───────────────╯\n◈ ${bold("STATUS")}: ${bold("RESULT...")}`,
        animMsg.messageID
      );
    } catch (e) {}

    await delay(1800);

    const finalMsg =
      `   ◢ SLOTS MACHINE ◣\n╭───────────────╮\n│    ${s1}  │  ${s2}  │  ${s3}  │\n╰───────────────╯\n` +
      `◈ ${bold("STATUS")}: ${bold(statusText)}\n` +
      `─────────────────\n` +
      `⌬ ${bold("BET")} : ${bold(formatMoney(bet))}\n` +
      `⌬ ${bold("WIN")} : ${bold(winnings > 0 ? "+" + formatMoney(winnings) : "0")}\n` +
      `⌬ ${bold("BAL")} : ${bold(formatMoney(finalBalance))}`;

    try {
      await api.editMessage(finalMsg, animMsg.messageID);
    } catch (e) {
      await api.sendMessage(finalMsg, threadID);
    }

    return;
  }
};
