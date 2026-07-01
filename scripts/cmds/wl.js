const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "whitelist",
    aliases: ["wl"],
    version: "2.1",
    author: "NeoKEX + Camille Uchiha",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage whitelist for users and threads - Control who can use the bot",
      fr: "Gérer la liste blanche users et groupes - Contrôle qui peut utiliser le bot"
    },
    category: "owner",
    guide: {
      en: '...',
      fr: '📋 LISTE BLANCHE USERS:\n' +
        ' {pn} user add <uid | @tag>: Ajouter un user\n' +
        ' {pn} user remove <uid | @tag>: Retirer un user\n' +
        ' {pn} user list: Voir la liste users\n' +
        ' {pn} user on/off: Activer/désactiver mode user\n' +
        '📋 LISTE BLANCHE GROUPES:\n' +
        ' {pn} thread add [id]: Ajouter un groupe [actuel si vide]\n' +
        ' {pn} thread remove [id]: Retirer un groupe\n' +
        ' {pn} thread list: Voir la liste groupes\n' +
        ' {pn} thread on/off: Activer/désactiver mode groupe\n' +
        '📊 STATUS:\n' +
        ' {pn} status: Voir le statut des deux listes'
    }
  },

  langs: {
    en: {...},
    fr: {
      userAdded: "✅ | %1 user(s) ajouté(s) à la liste:\n%2",
      userAlreadyWhitelisted: "\n⚠️ | %1 user(s) étaient déjà dans la liste:\n%2",
      userMissingId: "⚠️ | Entre un ID ou tag un user.",
      userRemoved: "✅ | %1 user(s) retiré(s) de la liste:\n%2",
      userNotWhitelisted: "\n⚠️ | %1 user(s) pas dans la liste:\n%2",
      userList: "📋 | Users autorisés (%1):\n%2",
      userEmptyList: "📋 | Aucun user dans la liste.",
      userModeEnabled: "✅ | Mode liste blanche USER ACTIVÉ.\nSeuls les users autorisés peuvent utiliser le bot.",
      userModeDisabled: "✅ | Mode liste blanche USER DÉSACTIVÉ.",

      threadAdded: "✅ | Groupe ajouté à la liste:\n• %1 (%2)",
      threadAlreadyWhitelisted: "⚠️ | Ce groupe est déjà autorisé.",
      threadRemoved: "✅ | Groupe retiré de la liste:\n• %1",
      threadNotWhitelisted: "⚠️ | Ce groupe n'est pas autorisé.",
      threadList: "📋 | Groupes autorisés (%1):\n%2",
      threadEmptyList: "📋 | Aucun groupe autorisé.",
      threadModeEnabled: "✅ | Mode liste blanche GROUPE ACTIVÉ.\nSeuls les groupes autorisés peuvent utiliser le bot.",
      threadModeDisabled: "✅ | Mode liste blanche GROUPE DÉSACTIVÉ.",
      threadInvalidId: "⚠️ | Entre un ID de groupe valide.",

      status: "📊 | STATUT LISTE BLANCHE\n👤 Users: %1\n Total: %2\n💬 Groupes: %3\n Total: %4",
      noPermission: "❌ | Réservé aux Premium ou plus.",
      invalidSubcommand: "⚠️ | Sous-commande invalide. Utilise: user, thread, ou status"
    }
  },

  onStart: async function ({ message, args, usersData, threadsData, event, getLang, role }) {
    if (!config.whiteListMode) {
      config.whiteListMode = { enable: false, whiteListIds: [] };
    }
    if (!config.whiteListMode.whiteListIds) {
      config.whiteListMode.whiteListIds = [];
    }
    if (!config.whiteListModeThread) {
      config.whiteListModeThread = { enable: false, whiteListThreadIds: [] };
    }
    if (!config.whiteListModeThread.whiteListThreadIds) {
      config.whiteListModeThread.whiteListThreadIds = [];
    }

    const saveConfig = () => {
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    };

    const subCommand = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();

    switch (subCommand) {
      case "user":
      case "u": {
        switch (action) {
          case "add":
          case "-a": {
            if (role < 3) return message.reply(getLang("noPermission"));

            let uids = [];
            if (Object.keys(event.mentions).length > 0) {
              uids = Object.keys(event.mentions);
            } else if (event.messageReply) {
              uids.push(event.messageReply.senderID);
            } else {
              uids = args.slice(2).filter(arg =>!isNaN(arg));
            }

            if (uids.length === 0) {
              return message.reply(getLang("userMissingId"));
            }

            const added = [];
            const alreadyExists = [];

            for (const uid of uids) {
              const uidStr = String(uid);
              if (config.whiteListMode.whiteListIds.map(String).includes(uidStr)) {
                alreadyExists.push(uidStr);
              } else {
                config.whiteListMode.whiteListIds.push(uidStr);
                added.push(uidStr);
              }
            }

            saveConfig();

            const addedNames = await Promise.all(
              added.map(async uid => {
                const name = await usersData.getName(uid);
                return `• ${name} (${uid})`;
              })
            );
            const alreadyNames = await Promise.all(
              alreadyExists.map(async uid => {
                const name = await usersData.getName(uid);
                return `• ${name} (${uid})`;
              })
            );

            let response = "";
            if (added.length > 0) {
              response += getLang("userAdded", added.length, addedNames.join("\n"));
            }
            if (alreadyExists.length > 0) {
              response += getLang("userAlreadyWhitelisted", alreadyExists.length, alreadyNames.join("\n"));
            }

            return message.reply(response);
          }

          case "remove":
          case "-r":
          case "delete":
          case "-d": {
            if (role < 3) return message.reply(getLang("noPermission"));

            let uids = [];
            if (Object.keys(event.mentions).length > 0) {
              uids = Object.keys(event.mentions);
            } else if (event.messageReply) {
              uids.push(event.messageReply.senderID);
            } else {
              uids = args.slice(2).filter(arg =>!isNaN(arg));
            }

            if (uids.length === 0) {
              return message.reply(getLang("userMissingId"));
            }

            const removed = [];
            const notFound = [];

            for (const uid of uids) {
              const uidStr = String(uid);
              const index = config.whiteListMode.whiteListIds.map(String).indexOf(uidStr);
              if (index!== -1) {
                config.whiteListMode.whiteListIds.splice(index, 1);
                removed.push(uidStr);
              } else {
                notFound.push(uidStr);
              }
            }

            saveConfig();

            const removedNames = await Promise.all(
              removed.map(async uid => {
                const name = await usersData.getName(uid);
                return `• ${name} (${uid})`;
              })
            );
            const notFoundNames = await Promise.all(
              notFound.map(async uid => {
                const name = await usersData.getName(uid);
                return `• ${name} (${uid})`;
              })
            );

            let response = "";
            if (removed.length > 0) {
              response += getLang("userRemoved", removed.length, removedNames.join("\n"));
            }
            if (notFound.length > 0) {
              response += getLang("userNotWhitelisted", notFound.length, notFoundNames.join("\n"));
            }

            return message.reply(response);
          }

          case "list":
          case "-l": {
            const whitelistIds = config.whiteListMode.whiteListIds;

            if (whitelistIds.length === 0) {
              return message.reply(getLang("userEmptyList"));
            }

            const userNames = await Promise.all(
              whitelistIds.map(async uid => {
                const name = await usersData.getName(uid);
                return `• ${name} (${uid})`;
              })
            );

            return message.reply(getLang("userList", whitelistIds.length, userNames.join("\n")));
          }

          case "on":
          case "enable": {
            if (role < 3) return message.reply(getLang("noPermission"));

            config.whiteListMode.enable = true;
            saveConfig();
            return message.reply(getLang("userModeEnabled"));
          }

          case "off":
          case "disable": {
            if (role < 3) return message.reply(getLang("noPermission"));

            config.whiteListMode.enable = false;
            saveConfig();
            return message.reply(getLang("userModeDisabled"));
          }

          default:
            return message.SyntaxError();
        }
      }

      case "thread":
      case "t":
      case "group":
      case "g": {
        switch (action) {
          case "add":
          case "-a": {
            if (role < 3) return message.reply(getLang("noPermission"));

            let threadID = args[2];
            if (!threadID) {
              threadID = event.threadID;
            }

            if (!threadID || isNaN(threadID)) {
              return message.reply(getLang("threadInvalidId"));
            }

            const threadIDStr = String(threadID);

            if (config.whiteListModeThread.whiteListThreadIds.map(String).includes(threadIDStr)) {
              return message.reply(getLang("threadAlreadyWhitelisted"));
            }

            config.whiteListModeThread.whiteListThreadIds.push(threadIDStr);
            saveConfig();

            let threadName = "Groupe inconnu";
            try {
              const threadInfo = await threadsData.get(threadIDStr);
              threadName = threadInfo?.threadName || threadName;
            } catch (e) {}

            return message.reply(getLang("threadAdded", threadName, threadIDStr));
          }

          case "remove":
          case "-r":
          case "delete":
          case "-d": {
            if (role < 3) return message.reply(getLang("noPermission"));

            let threadID = args[2];
            if (!threadID) {
              threadID = event.threadID;
            }

            if (!threadID || isNaN(threadID)) {
              return message.reply(getLang("threadInvalidId"));
            }

            const threadIDStr = String(threadID);
            const index = config.whiteListModeThread.whiteListThreadIds.map(String).indexOf(threadIDStr);

            if (index === -1) {
              return message.reply(getLang("threadNotWhitelisted"));
            }

            config.whiteListModeThread.whiteListThreadIds.splice(index, 1);
            saveConfig();

            return message.reply(getLang("threadRemoved", threadIDStr));
          }

          case "list":
          case "-l": {
            const threadIds = config.whiteListModeThread.whiteListThreadIds;

            if (threadIds.length === 0) {
              return message.reply(getLang("threadEmptyList"));
            }

            const threadNames = await Promise.all(
              threadIds.map(async tid => {
                let name = "Groupe inconnu";
                try {
                  const threadInfo = await threadsData.get(String(tid));
                  name = threadInfo?.threadName || name;
                } catch (e) {}
                return `• ${name} (${tid})`;
              })
            );

            return message.reply(getLang("threadList", threadIds.length, threadNames.join("\n")));
          }

          case "on":
          case "enable": {
            if (role < 3) return message.reply(getLang("noPermission"));

            config.whiteListModeThread.enable = true;
            saveConfig();
            return message.reply(getLang("threadModeEnabled"));
          }

          case "off":
          case "disable": {
            if (role < 3) return message.reply(getLang("noPermission"));

            config.whiteListModeThread.enable = false;
            saveConfig();
            return message.reply(getLang("threadModeDisabled"));
          }

          default:
            return message.SyntaxError();
        }
      }

      case "status":
      case "info": {
        const userEnabled = config.whiteListMode.enable? "ON" : "OFF";
        const userCount = config.whiteListMode.whiteListIds.length;
        const threadEnabled = config.whiteListModeThread.enable? "ON" : "OFF";
        const threadCount = config.whiteListModeThread.whiteListThreadIds.length;

        return message.reply(getLang("status", userEnabled, userCount, threadEnabled, threadCount));
      }

      default:
        return message.reply(getLang("invalidSubcommand"));
    }
  }
};
