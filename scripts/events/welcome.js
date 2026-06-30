const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent) global.temp.welcomeEvent = {};

module.exports = {
        config: {
                name: "welcome",
                version: "2.1",
                author: "NTKhang + Modified by Camille Uchiha",
                category: "events"
        },

        langs: {
                vi: {
                        session1: "☀ 𝗦𝗮́𝗻𝗴",
                        session2: "⛅ 𝗧𝗿𝘂̛𝗮",
                        session3: "🌆 𝗖𝗵𝗶𝗲̂̀𝘂",
                        session4: "🌙 𝗧𝗼̂́𝗶",
                        welcomeMessage: "✨ 𝗖𝗮̉𝗺 𝗼̛𝗻 𝗯𝗮̣𝗻 𝗱𝗮̃ 𝗺𝗼̛̀𝗶 𝘁𝗼̂𝗶 𝘃𝗮̀𝗼 𝗻𝗵𝗼́𝗺!\n⚡ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗯𝗼𝘁: %1\n🔎 Đ𝗲̂̉ 𝘅𝗲𝗺 𝗱𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵 𝗹𝗲̣̂𝗻𝗵 𝗵𝗮̃𝘆 𝗻𝗵𝗮̣̂𝗽: %1help",
                        multiple1: "🔹 𝗕𝗮̣𝗻",
                        multiple2: "🔹 𝗖𝗮́𝗰 𝗯𝗮̣𝗻",
                        defaultWelcomeMessage: "🎉 𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 {userName} 🎊\n\n🚀 𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 𝗯𝗮̣𝗻 𝗱𝗲̂́𝗻 𝘃𝗼̛́𝗶 『 {boxName} 』\n🔹 𝗖𝗵𝘂́𝗰 𝗯𝗮̣𝗻 𝗰𝗼́ 𝗯𝘂𝗼̂̉𝗶 {session} 𝘃𝘂𝗶 𝘃𝗲̉! ✨"
                },
                en: {
                        session1: "☀ 𝚖𝚘𝚛𝚗𝚒𝚗𝚐",
                        session2: "⛅ 𝚗𝚘𝚗",
                        session3: "🌆 𝚊𝚏𝚝𝚎𝚛𝚗𝚘𝚗",
                        session4: "🌙 𝚎𝚟𝚎𝚗𝚒𝚗𝚐",
                        welcomeMessage: "𝚃𝚑𝚊𝚗𝚔 𝚢𝚘𝚞 𝚏𝚘𝚛 𝚒𝚗𝚟𝚒𝚝𝚒𝚗𝚐 𝚖𝚎 𝚝𝚘 𝚝𝚑𝚎 𝚐𝚛𝚘𝚞𝚙!\n𝙱𝚘𝚝 𝚙𝚛𝚎𝚏𝚒𝚡: %1\n𝚃𝚘 𝚟𝚒𝚎𝚠 𝚝𝚑𝚎 𝚕𝚒𝚜𝚝 𝚘𝚏 𝚌𝚘𝚖𝚊𝚗𝚍𝚜, 𝚙𝚕𝚎𝚊𝚜𝚎 𝚎𝚗𝚝𝚎𝚛: %1𝚑𝚎𝚕𝚙",
                        multiple1: "🔹 𝚢𝚘𝚞",
                        multiple2: "🔹 𝚢𝚘𝚞 𝚐𝚞𝚢𝚜",
                        defaultWelcomeMessage: "╭──────────────────╮\n☺️ＢＩＥＮＶＥＮＵＥ\n╰──────────────────╯ \n𝙳𝚎𝚊𝚛✨{userName}✨\n.𝚆𝚎𝚕𝚌𝚘𝚖𝚎 {multiple} 𝚝𝚘 𝚝𝚑𝚎 𝚌𝚑𝚊𝚝 𝚐𝚛𝚘𝚞𝚙:{boxName}!\n𝙷𝚊𝚟𝚎 𝚊 𝚗𝚒𝚌𝚎 {session}!\n\n╭──────────────────╮\n 📥 𝙰𝚍𝚎𝚍 𝚋𝚢: ✨{adderName}✨\n╰──────────────────╯"
                },
                fr: { // FR 225 AJOUTÉ ICI
                        session1: "☀ 𝙼𝚊𝚝𝚒𝚗",
                        session2: "⛅ 𝙼𝚒𝚍𝚒",
                        session3: "🌆 𝙰𝚙𝚛𝚎̀𝚜-𝚖𝚒𝚍𝚒",
                        session4: "🌙 𝚂𝚘𝚒𝚛",
                        welcomeMessage: "✨ 𝙼𝚎𝚛𝚌𝚒 𝚍𝚎 𝚖'𝚊𝚟𝚘𝚒𝚛 𝚊𝚓𝚘𝚞𝚝𝚎́ 𝚊𝚞 𝚐𝚛𝚘𝚞𝚙𝚎!\n⚡ 𝙿𝚛𝚎́𝚏𝚒𝚡𝚎 𝚋𝚘𝚝: %1\n🔎 𝙿𝚘𝚞𝚛 𝚟𝚘𝚒𝚛 𝚕𝚎𝚜 𝚌𝚘𝚖𝚊𝚗𝚍𝚎𝚜: %1help",
                        multiple1: "🔹 𝚃𝚘𝚒",
                        multiple2: "🔹 𝚅𝚘𝚞𝚜 𝚝𝚘𝚞𝚜",
                        defaultWelcomeMessage: "╭──────────────────╮\n☺️ 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝚄𝙴\n╰──────────────────╯ \n✨{userName}✨\n.𝙱𝚒𝚎𝚗𝚟𝚎𝚗𝚞𝚎 {multiple} 𝚍𝚊𝚗𝚜 𝚕𝚎 𝚐𝚛𝚘𝚞𝚙𝚎: {boxName}!\n𝙿𝚊𝚜𝚎 𝚞𝚗 𝚋𝚘𝚗 {session}!\n\n╭──────────────────╮\n 📥 𝙰𝚓𝚘𝚞𝚝𝚎́ 𝚙𝚊𝚛: ✨{adderName}✨\n╰──────────────────╯"
                }
        },

        onStart: async ({ threadsData, message, event, api, getLang }) => {
                if (event.logMessageType!== "log:subscribe") return;

                const { threadID, logMessageData } = event;
                const { addedParticipants } = logMessageData;
                const hours = getTime("HH");
                const prefix = global.utils.getPrefix(threadID);
                const nickNameBot = global.GoatBot.config.nickNameBot;

                if (addedParticipants.some(user => user.userFbId === api.getCurrentUserID())) {
                        if (nickNameBot) api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
                        return message.send(getLang("welcomeMessage", prefix));
                }

                if (!global.temp.welcomeEvent[threadID]) {
                        global.temp.welcomeEvent[threadID] = { joinTimeout: null, dataAddedParticipants: [] };
                }

                global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...addedParticipants);

                clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

                global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async () => {
                        const threadData = await threadsData.get(threadID);
                        if (threadData.settings.sendWelcomeMessage === false) return;

                        const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
                        const bannedUsers = threadData.data.banned_ban || [];
                        const threadName = threadData.threadName;

                        let newMembers = [], mentions = [];
                        let isMultiple = dataAddedParticipants.length > 1;

                        for (const user of dataAddedParticipants) {
                                if (bannedUsers.some(banned => banned.id === user.userFbId)) continue;
                                newMembers.push(user.fullName);
                                mentions.push({ tag: user.fullName, id: user.userFbId });
                        }

                        if (newMembers.length === 0) return;

                        // Get info of the adder
                        const adderID = event.author;
                        const adderInfo = await api.getUserInfo(adderID);
                        const adderName = adderInfo[adderID]?.name || "Quelqu'un";
                        mentions.push({ tag: adderName, id: adderID });

                        let welcomeMessage = threadData.data.welcomeMessage || getLang("defaultWelcomeMessage");

                        welcomeMessage = welcomeMessage
                               .replace(/\{userName\}|\{userNameTag\}/g, newMembers.join(", "))
                               .replace(/\{boxName\}|\{threadName\}/g, threadName)
                               .replace(/\{multiple\}/g, isMultiple? getLang("multiple2") : getLang("multiple1"))
                               .replace(/\{session\}/g,
                                        hours <= 10? getLang("session1") :
                                        hours <= 12? getLang("session2") :
                                        hours <= 18? getLang("session3") : getLang("session4")
                                )
                               .replace(/\{adderName\}/g, adderName);

                        let form = {
                                body: welcomeMessage,
                                mentions: mentions
                        };

                        if (threadData.data.welcomeAttachment) {
                                const files = threadData.data.welcomeAttachment;
                                const attachments = files.map(file => drive.getFile(file, "stream"));

                                form.attachment = (await Promise.allSettled(attachments))
                                       .filter(({ status }) => status === "fulfilled")
                                       .map(({ value }) => value);
                        }

                        message.send(form);
                        delete global.temp.welcomeEvent[threadID];
                }, 1500);
        }
};
