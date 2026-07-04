const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
	config: {
		name: "gpa",
		version: "1.0.1",
		author: "Camille Uchiha",
		countDown: 5,
		role: 2,
		description: {
			fr: "Change la photo du groupe en répondant à une image ou via un lien."
		},
		category: "admin",
		guide: {
			fr: " Répondez à une image avec {pn} OU {pn} <lien>"
		}
	},

	// Section vidée pour éviter les conflits d'architecture avec getLang
	languages: {
		vi: {},
		en: {},
		fr: {}
	},

	onStart: async function ({ args, message, event, api }) {
		const { config } = global.GoatBot;
		const { senderID, threadID, isGroup, messageReply } = event;

		// 1. Vérification Admin du Bot
		if (!config.adminBot.includes(senderID)) {
			return message.reply("❌ Réservé aux administrateurs du bot.");
		}

		// 2. Vérification mode Groupe
		if (!isGroup) {
			return message.reply("❌ Cette commande doit être exécutée dans un groupe.");
		}

		let imageUrl = "";

		// 3. Extraction de l'image (Message répondu)
		if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
			if (messageReply.attachments[0].type === "photo") {
				imageUrl = messageReply.attachments[0].url;
			}
		} 
		// 4. Extraction de l'image (Lien URL direct)
		else if (args && args.length > 0) {
			imageUrl = args.join("");
		}

		if (!imageUrl) {
			return message.reply("❌ Répondez à une image ou fournissez un lien valide.");
		}

		const cachePath = path.join(__dirname, "cache", `gpa_${threadID}.png`);
		await fs.ensureDir(path.dirname(cachePath));

		try {
			await message.reply("⚡ Application de la nouvelle photo...");

			const response = await axios({
				url: imageUrl,
				method: "GET",
				responseType: "stream"
			});

			const writer = fs.createWriteStream(cachePath);
			response.data.pipe(writer);

			await new Promise((resolve, reject) => {
				writer.on("finish", resolve);
				writer.on("error", reject);
			});

			// Changement effectif de l'avatar du groupe
			await api.changeGroupImage(fs.createReadStream(cachePath), threadID);

			if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
			return message.reply("✅ Photo du groupe mise à jour !");

		} catch (error) {
			if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
			console.error(error);
			return message.reply("❌ Échec de la modification. Vérifiez les droits du bot.");
		}
	}
};


