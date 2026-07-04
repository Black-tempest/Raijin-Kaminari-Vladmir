module.exports = {
    config: {
        name: "ping",
        version: "1.0",
        author: "camille uchiha",
        countDown: 5,
        role: 0,
        description: {
            vi: "Kiểm tra tốc độ phản hồi và trạng thái hệ thống",
            en: "Check the response speed and system status"
        },
        category: "system",
        guide: {
            vi: "   {pn}",
            en: "   {pn}"
        }
    },

    onStart: async function ({ api, message, event }) {
        const startTime = Date.now();
        
        // 1. On envoie le message de chargement classique
        const pingMessage = await message.reply("⚡ Analyse du système...");

        // 2. Calcul de la vitesse de réponse (Latence)
        const responseTime = Date.now() - startTime;

        // 3. Calcul du temps d'allumage (Uptime)
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (3600 * 24));
        const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);
        
        let uptimeString = "";
        if (days > 0) uptimeString += `${days}j `;
        if (hours > 0) uptimeString += `${hours}h `;
        if (minutes > 0) uptimeString += `${minutes}m `;
        uptimeString += `${seconds}s`;

        // 4. Calcul de l'utilisation de la mémoire RAM
        const memoryUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        // 5. On supprime le message temporaire en utilisant l'ID via api.unsendMessage
        try {
            await api.unsendMessage(pingMessage.messageID);
        } catch (e) {
            // Si la suppression échoue, on continue quand même pour ne pas bloquer le bot
        }

        // 6. Envoi du rapport complet final
        return message.reply(
            `🏓 📊 𝗘́𝗧𝗔𝗧 𝗗𝗨 𝗦𝗬𝗦𝗧𝗘̀𝗠𝗘 📊\n\n` +
            `⏱️ 𝗟𝗮𝘁𝗲𝗻𝗰𝗲 : ${responseTime} ms\n` +
            `⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲 : En ligne depuis ${uptimeString}\n` +
            `💾 𝗠𝗲́𝗺𝗼𝗶𝗿𝗲 𝗥𝗔𝗠 : ${memoryUsed} Mo utilisés`
        );
    }
};


