const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		version: "1.7",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "gửi báo cáo, gop ý, báo lỗi,... của bạn về admin bot",
			en: "envoyer un rapport, des commentaires, un bug,... au bot d'administration",
			fr: "Envoyer un rapport, des commentaires ou un bug aux administrateurs du bot"
		},
		category: "info",
		guide: {
			vi: " {pn} <tin nhắn>",
			en: " {pn} <message>",
			fr: " {pn} <votre message>"
		}
	},

	languages: {
		vi: {
			missingMessage: "Vui lòng nhập tin nhắn bạn muốn gửi về admin",
			sendByGroup: "\n- Gửi từ nhóm: %1\n- Thread ID: %2",
			sendByUser: "\n- Gửi từ người dùng",
			content: "\n\nNội dung:\n─────────────────\n%1\n─────────────────\nPhản hồi tin nhắn này để chat tiếp với admin",
			success: "Đã gửi tin nhắn của bạn về %1 admin thành công!\n%2",
			failed: "Đã có lỗi xảy ra khi gửi tin nhắn của bạn về %1 admin\n%2",
			reply: "⌖ Phản hồi từ admin %1:\n─────────────────\n%2\n─────────────────\nPhản hồi tin nhắn này để chat tiếp với admin",
			replySuccess: "Đã gửi phản hồi của bạn về admin thành công!",
			feedback: "✎ Phản hồi từ người dùng %1:\n- User ID: %2%3\n\nNội dung:\n─────────────────\n%4\n─────────────────\nPhản hồi tin nhắn này để chat tiếp với người dùng",
			replyUserSuccess: "Đã gửi phản hồi về người dùng thành công!",
			noAdmin: "Bot hiện tại không có admin nào."
		},
		en: {
			missingMessage: "Veuillez saisir le message que vous souhaitez envoyer à l'administrateur.",
			sendByGroup: "\n- Envoyé depuis le groupe : %1\n- ID du groupe : %2",
			sendByUser: "\n- Envoyé par l'utilisateur directement",
			content: "\n\nContenu :\n─────────────────\n%1\n─────────────────\nRépondez à ce message pour écrire à l'administrateur.",
			success: "Votre message a été envoyé avec succès à %1 administrateur(s) !\n%2",
			failed: "Une erreur s'est produite lors de l'envoi de votre message à %1 administrateur(s)\n%2",
			reply: "⌖ Réponse de l'administrateur %1 :\n─────────────────\n%2\n─────────────────\nRépondez à ce message pour continuer à écrire à l'administrateur.",
			replySuccess: "Votre réponse à l'administrateur a été envoyée avec succès !",
			feedback: "✎ Commentaires de l'utilisateur %1 :\n- ID utilisateur : %2%3\n\nContenu :\n─────────────────\n%4\n─────────────────\nRépondez à ce message pour écrire à l'utilisateur.",
			replyUserSuccess: "Réponse envoyée à l'utilisateur avec succès !",
			noAdmin: "Ce bot n'a pas d'administrateur configuré pour le moment."
		},
		fr: {
			missingMessage: "Veuillez saisir le message que vous souhaitez envoyer à l'administrateur.",
			sendByGroup: "\n- Envoyé depuis le groupe : %1\n- ID du groupe : %2",
			sendByUser: "\n- Envoyé par l'utilisateur directement",
			content: "\n\nContenu :\n─────────────────\n%1\n─────────────────\nRépondez à ce message pour écrire à l'administrateur.",
			success: "Votre message a été envoyé avec succès à %1 administrateur(s) !\n%2",
			failed: "Une erreur s'est produite lors de l'envoi de votre message à %1 administrateur(s)\n%2",
			reply: "⌖ Réponse de l'administrateur %1 :\n─────────────────\n%2\n─────────────────\nRépondez à ce message pour continuer à écrire à l'administrateur.",
			replySuccess: "Votre réponse à l'administrateur a été envoyée avec succès !",
			feedback: "✎ Commentaires de l'utilisateur %1 :\n- ID utilisateur : %2%3\n\nContenu :\n─────────────────\n%4\n─────────────────\nRépondez à ce message pour écrire à l'utilisateur.",
			replyUserSuccess: "Réponse envoyée à l'utilisateur avec succès !",
			noAdmin: "Ce bot n'a pas d'administrateur configuré pour le moment."
		}
	},

	onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
		const { config } = global.GoatBot;
		
		if (!args || args.length === 0) return message.reply(getLang("missingMessage"));
		
		const { senderID, threadID, isGroup } = event;
		
		if (!config.adminBot || config.adminBot.length == 0) return message.reply(getLang("noAdmin"));
		
		const senderName = await usersData.getName(senderID);
		let groupDetails = "";
		
		if (isGroup) {
			const threadInfo = await threadsData.get(threadID) || {};
			groupDetails = getLang("sendByGroup", threadInfo.threadName || "Groupe sans nom", threadID);
		} else {
			groupDetails = getLang("sendByUser");
		}

		const msg = "==📨️ APPEL ADMIN 📨️=="
			+ `\n- Nom d'utilisateur : ${senderName}`
			+ `\n- ID utilisateur : ${senderID}`
			+ groupDetails;

		const attachments = await getStreamsFromAttachment(
			[...event.attachments, ...(event.messageReply?.attachments || [])]
				.filter(item => mediaTypes.includes(item.type))
		);

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{ id: senderID, tag: senderName }],
			attachment: attachments
		};

		const successIDs = [];
		const failedIDs = [];
		const adminNames = [];

		for (const uid of config.adminBot) {
			try {
				const name = await usersData.getName(uid);
				adminNames.push({ id: uid, name: name });
				
				const messageSend = await api.sendMessage(formMessage, uid);
				successIDs.push(uid);
				
				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			} catch (err) {
				failedIDs.push({ adminID: uid, error: err });
			}
		}

		let msg2 = "";
		if (successIDs.length > 0) {
			msg2 += getLang("success", successIDs.length,
				adminNames.filter(item => successIDs.includes(item.id)).map(item => ` <@${item.id}> (${item.name})`).join("\n")
			);
		}
		if (failedIDs.length > 0) {
			msg2 += (msg2 ? "\n" : "") + getLang("failed", failedIDs.length,
				failedIDs.map(item => ` <@${item.adminID}>`).join("\n")
			);
			log.err("APPEL ADMIN EN ÉCHEC", failedIDs);
		}
		
		return message.reply({
			body: msg2,
			mentions: adminNames.map(item => ({ id: item.id, tag: item.name }))
		});
	},

	onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
		const { type, threadID, messageIDSender } = Reply;
		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		const attachments = await getStreamsFromAttachment(
			event.attachments.filter(item => mediaTypes.includes(item.type))
		);

		switch (type) {
			case "userCallAdmin": {
				const formMessage = {
					body: getLang("reply", senderName, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: attachments
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.reply("Erreur lors de l'envoi : " + JSON.stringify(err));
					message.reply(getLang("replyUserSuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "adminReply"
					});
				}, messageIDSender);
				break;
			}
			case "adminReply": {
				let sendByGroup = "";
				if (isGroup) {
					try {
						const threadInfo = await api.getThreadInfo(event.threadID);
						sendByGroup = getLang("sendByGroup", threadInfo.threadName || "Groupe inconnu", event.threadID);
					} catch(e) {
						sendByGroup = getLang("sendByGroup", "Inconnu", event.threadID);
					}
				}
				
				const formMessage = {
					body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
					mentions: [{ id: event.senderID, tag: senderName }],
					attachment: attachments
				};

				api.sendMessage(formMessage, threadID, (err, info) => {
					if (err) return message.reply("Erreur lors de l'envoi : " + JSON.stringify(err));
					message.reply(getLang("replySuccess"));
					global.GoatBot.onReply.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						messageIDSender: event.messageID,
						threadID: event.threadID,
						type: "userCallAdmin"
					});
				}, messageIDSender);
				break;
			}
			default:
				break;
		}
	}
};
