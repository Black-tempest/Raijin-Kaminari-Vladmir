const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

moment.locale("fr");

module.exports = {
  config: {
    name: "daily",
    version: "3.0",
    author: "Veldora Tempest",
    role: 0,
    category: "economy",
    shortDescription: "Récompense quotidienne",
    longDescription: "Recevez 300 pièces et 234 expériences chaque jour. Une seule fois par jour.",
    guide: "{pn}"
  },

  onStart: async function ({ message, event, usersData, api }) {
    const senderID = event.senderID;
    const userName = (await usersData.getName(senderID)) || "Utilisateur";

    let userData = await usersData.get(senderID);
    if (!userData || typeof userData !== "object") userData = {};

    const now = moment().tz("Africa/Abidjan");
    const todayStart = now.clone().startOf("day").valueOf();

    const lastDaily = userData.daily?.last || 0;
    if (lastDaily && lastDaily >= todayStart) {
      const tomorrow = moment(lastDaily).add(1, "day").startOf("day");
      const remaining = moment.duration(tomorrow.diff(now)).humanize(true);
      return message.reply(`❌ Vous avez déjà réclamé votre récompense.\nRevenez ${remaining}.`);
    }

    if (typeof userData.money !== "number") userData.money = 0;
    if (typeof userData.exp !== "number") userData.exp = 0;

    userData.money += 300;
    userData.exp += 234;

    userData.daily = { last: todayStart };
    await usersData.set(senderID, userData);

    const updated = await usersData.get(senderID);
    const newBalance = updated?.money || userData.money;
    const newExp = updated?.exp || userData.exp;

    const bold = (text) => {
      const map = {
        A:"𝐀",B:"𝐁",C:"𝐂",D:"𝐃",E:"𝐄",F:"𝐅",G:"𝐆",H:"𝐇",I:"𝐈",J:"𝐉",
        K:"𝐊",L:"𝐋",M:"𝐌",N:"𝐍",O:"𝐎",P:"𝐏",Q:"𝐐",R:"𝐑",S:"𝐒",T:"𝐓",
        U:"𝐔",V:"𝐕",W:"𝐖",X:"𝐗",Y:"𝐘",Z:"𝐙",
        a:"𝐚",b:"𝐛",c:"𝐜",d:"𝐝",e:"𝐞",f:"𝐟",g:"𝐠",h:"𝐡",i:"𝐢",j:"𝐣",
        k:"𝐤",l:"𝐥",m:"𝐦",n:"𝐧",o:"𝐨",p:"𝐩",q:"𝐪",r:"𝐫",s:"𝐬",t:"𝐭",
        u:"𝐮",v:"𝐯",w:"𝐰",x:"𝐱",y:"𝐲",z:"𝐳"
      };
      return text.split('').map(c => map[c] || c).join('');
    };

    const italic = (text) => {
      const map = {
        A:"𝘈",B:"𝘉",C:"𝘊",D:"𝘋",E:"𝘌",F:"𝘍",G:"𝘎",H:"𝘏",I:"𝘐",J:"𝘑",
        K:"𝘒",L:"𝘓",M:"𝘔",N:"𝘕",O:"𝘖",P:"𝘗",Q:"𝘘",R:"𝘙",S:"𝘚",T:"𝘛",
        U:"𝘜",V:"𝘝",W:"𝘞",X:"𝘟",Y:"𝘠",Z:"𝘡",
        a:"𝘢",b:"𝘣",c:"𝘤",d:"𝘥",e:"𝘦",f:"𝘧",g:"𝘨",h:"𝘩",i:"𝘪",j:"𝘫",
        k:"𝘬",l:"𝘭",m:"𝘮",n:"𝘯",o:"𝘰",p:"𝘱",q:"𝘲",r:"𝘳",s:"𝘴",t:"𝘵",
        u:"𝘶",v:"𝘷",w:"𝘸",x:"𝘹",y:"𝘺",z:"𝘻"
      };
      return text.split('').map(c => map[c] || c).join('');
    };

    const reply = 
`࿇ ══━━━✥◈✥━━━══ ࿇
@${userName} voilà votre récompense du jour
${bold("Argent")} : ${bold("300")} ${italic("pièces")}
${bold("Expérience")} : ${bold("234")} ${italic("points")}
━━━━━━━━━━━━━━━━━━━━━
${bold("Nouveau solde")} : ${bold(String(newBalance))} ${italic("pièces")}
${bold("Exp totale")} : ${bold(String(newExp))} ${italic("points")}
࿇ ══━━━✥◈✥━━━══ ࿇`;

    return message.reply(reply);
  }
};
