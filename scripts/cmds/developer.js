const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
        config: {
                name: "developer",
                aliases: ["dev"], // Garde ça pour!dev
        version: "1.1",
        author: "NeoKEX + Camille Uchiha",
                countDown: 5,
                role: 4, // 4 = Developer only
                description: {
                        vi: "Thêm, xóa, sửa quyền developer",
                        en: "Add, remove, edit developer role",
                        fr: "Ajouter, supprimer, voir les développeurs du bot"
                },
                category: "owner",
                guide: {
                        vi: '...',
                        en: '...',
                        fr: ' {pn} add -a <uid | @tag>: Donner le rôle dev'
                                + '\n {pn} remove -r <uid | @tag>: Retirer le rôle dev'
                                + '\n {pn} list -l: Voir la liste des devs'
                }
        },

        langs: {
                vi: {...},
                en: {...},
                fr: {
                        added: "✅ | Rôle dev donné à %1 user(s):\n%2",
                        alreadyDev: "\n⚠️ | %1 user(s) étaient déjà dev:\n%2",
                        missingIdAdd: "⚠️ | Entre un ID ou tag le user à mettre dev",
                        removed: "✅ | Rôle dev retiré à %1 user(s):\n%2",
                        notDev: "⚠️ | %1 user(s) n'étaient pas dev:\n%2",
                        missingIdRemove: "⚠️ | Entre un ID ou tag le user à retirer",
                        listDev: "⚙️ | Liste des développeurs:\n%1"
                }
        },

        onStart: async function ({ message, args, usersData, event, getLang }) {
                if (!config.devUsers)
                        config.devUsers = [];

                switch (args[0]) {
                        case "add":
                        case "-a": {
                                if (args[1]) {
                                        let uids = [];
                                        if (Object.keys(event.mentions).length > 0)
                                                uids = Object.keys(event.mentions);
                                        else if (event.messageReply)
                                                uids.push(event.messageReply.senderID);
                                        else
                                                uids = args.filter(arg =>!isNaN(arg));
                                        const notDevIds = [];
                                        const devIds = [];
                                        for (const uid of uids) {
                                                if (config.devUsers.includes(uid))
                                                        devIds.push(uid);
                                                else
                                                        notDevIds.push(uid);
                                        }

                                        config.devUsers.push(...notDevIds);
                                        const getNames = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                                        return message.reply(
                                                (notDevIds.length > 0? getLang("added", notDevIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                                                + (devIds.length > 0? getLang("alreadyDev", devIds.length, devIds.map(uid => `• ${uid}`).join("\n")) : "")
                                        );
                                }
                                else
                                        return message.reply(getLang("missingIdAdd"));
                        }
                        case "remove":
                        case "-r": {
                                if (args[1]) {
                                        let uids = [];
                                        if (Object.keys(event.mentions).length > 0)
                                                uids = Object.keys(event.mentions);
                                        else
                                                uids = args.filter(arg =>!isNaN(arg));
                                        const notDevIds = [];
                                        const devIds = [];
                                        for (const uid of uids) {
                                                if (config.devUsers.includes(uid))
                                                        devIds.push(uid);
                                                else
                                                        notDevIds.push(uid);
                                        }
                                        for (const uid of devIds)
                                                config.devUsers.splice(config.devUsers.indexOf(uid), 1);
                                        const getNames = await Promise.all(devIds.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                        writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
                                        return message.reply(
                                                (devIds.length > 0? getLang("removed", devIds.length, getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
                                                + (notDevIds.length > 0? getLang("notDev", notDevIds.length, notDevIds.map(uid => `• ${uid}`).join("\n")) : "")
                                        );
                                }
                                else
                                        return message.reply(getLang("missingIdRemove"));
                        }
                        case "list":
                        case "-l": {
                                const getNames = await Promise.all(config.devUsers.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                                return message.reply(getLang("listDev", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n")));
                        }
                        default:
                                return message.SyntaxError();
                }
        }
};
