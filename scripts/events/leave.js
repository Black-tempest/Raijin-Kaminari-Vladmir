const axios = require("axios");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "leave",
		version: "1.6",
		author: "Camille 🤍",
		category: "events"
	},

	langs: {
		fr: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",
			leaveType1: "a quitté les archives",
			leaveType2: "a été banni",
			defaultLeaveMessage: "╔═══════ 🍎 ═══════╗\n   🌀 **DÉPART DÉTECTÉ** 🌀\n╚═══════ 🍎 ═══════╝\n👤 Membre : {userName}\n⚡ Action : {type}\n📅 Moment : {session}\n⏰ Heure : {time}h\n●▬▬▬▬▬▬▬▬▬▬▬▬▬▬●\n🚀 Archives Uchiha"
		}
	},

	onEvent: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType !== "log:unsubscribe") return;

		const { threadID } = event;
		const threadData = await threadsData.get(threadID);
		
		// Vérifie si les messages de départ sont activés dans la box
		if (threadData && threadData.settings && threadData.settings.sendLeaveMessage === false) return;
		
		const { leftParticipantFbId } = event.logMessageData;
		if (leftParticipantFbId == api.getCurrentUserID()) return;

		const timeNow = moment().tz("Africa/Abidjan");
		const hours = parseInt(timeNow.format("HH"), 10);
		const threadName = threadData ? threadData.threadName : "Groupe";
		const userName = await usersData.getName(leftParticipantFbId);

		let leaveMessage = (threadData && threadData.data && threadData.data.leaveMessage) || getLang("defaultLeaveMessage");
		
		const form = {
			mentions: leaveMessage.match(/\{userNameTag\}/g) ? [{
				tag: userName,
				id: leftParticipantFbId
			}] : []
		};

		leaveMessage = leaveMessage
			.replace(/\{userName\}|\{userNameTag\}/g, userName)
			.replace(/\{type\}/g, leftParticipantFbId == event.author ? getLang("leaveType1") : getLang("leaveType2"))
			.replace(/\{threadName\}|\{boxName\}/g, threadName)
			.replace(/\{time\}/g, hours)
			.replace(/\{session\}/g, hours <= 10 ?
				getLang("session1") :
				hours <= 12 ?
					getLang("session2") :
					hours <= 18 ?
						getLang("session3") :
						getLang("session4")
			);

		form.body = leaveMessage;

		// --- GESTION DU GIF UCHIHA ---
		const gifUrl = "https://i.ibb.co/zW1DZ0KX/686325842-1275234991430767-1463208806134011730-n-gif-nc-cat-106-ccb-1-7-nc-sid-cf94fc-nc-eui2-Ae-G.gif";
		const pathGif = __dirname + `/tmp/leave_${leftParticipantFbId}.gif`;

		try {
			if (!fs.existsSync(__dirname + "/tmp")) {
				fs.mkdirSync(__dirname + "/tmp", { recursive: true });
			}
			
			const { data } = await axios.get(gifUrl, { responseType: "arraybuffer" });
			fs.writeFileSync(pathGif, Buffer.from(data));
			form.attachment = [fs.createReadStream(pathGif)];
		} catch (e) {
			console.error("Erreur lors du chargement du GIF Uchiha:", e);
		}

		// Envoi du message et nettoyage du fichier temporaire
		message.send(form, () => {
			if (fs.existsSync(pathGif)) {
				fs.unlinkSync(pathGif);
			}
		});
	}
};
