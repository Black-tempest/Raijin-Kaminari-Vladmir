const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "developer",
		aliases: ["dev"],
		version: "1.1",
		author: "NeoKEX",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
	role: 4,
		description: {
			vi: "Thêm, xóa, sửa quyền developer",
			en: "Add, remove, edit developer role",
			fr: "Ajouter, supprimer, modifier le rôle développeur"
	},
		category: "owner",
	guide: {
			vi: ' {pn} [add | -a] <uid | @tag>: Thêm quyền developer cho người dùng'
				+ '\n {pn} [remove | -r] <uid | @tag>: Xóa quyền developer của người dùng'
				+ '\n {pn} [list | -l]: Liệt kê danh sách developers',
			en: ' {pn} [add | -a] <uid | @tag>: Add developer role for user'
				+ '\n {pn} [remove | -r] <uid | @tag>: Remove developer role of user'
				+ '\n {pn} [list | -l]: List all developers',
			fr: ' {pn} [add | -a] <uid | @tag>: Ajouter le rôle développeur'
				+ '\n {pn} [remove | -r] <uid | @tag>: Retirer le rôle développeur'
				+ '\n {pn} [list | -l]: Lister tous les développeurs'
	}
	},

	langs: {
		vi: {
			added: "✓ | Đã thêm quyền developer cho %1 người dùng:\n%2",
			alreadyDev: "\n⚠ | %1 người dùng đã có quyền developer từ trước rồi:\n%2",
			missingIdAdd: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn thêm quyền developer",
			removed: "✓ | Đã xóa quyền developer của %1 người dùng:\n%2",
			notDev: "⚠ | %1 người dùng không có quyền developer:\n%2",
			missingIdRemove: "⚠ | Vui lòng nhập ID hoặc tag người dùng muốn xóa quyền developer",
			listDev: "⚙ | Danh sách developers:\n%1"
	},
		en: {
			added: "✓ | Added developer role for %1 users:\n%2",
			alreadyDev: "\n⚠ | %1 users already have developer role:\n%2",
			missingIdAdd: "⚠ | Please enter ID or tag user to add developer role",
			removed: "✓ | Removed developer role of %1 users:\n%2",
			notDev: "⚠ | %1 users don't have developer role:\n%2",
			missingIdRemove: "⚠ | Please enter ID or tag user to remove developer role",
			listDev: "⚙ | List of developers:\n%1"
	},
		fr: {
			added: `🍓━━━━━━━━🍓\n✅ 𝗔𝗝𝗢𝗨𝗧 𝗗𝗘𝗩\n\nRôle développeur ajouté pour %1 utilisateur(s):\n%2\n🍓━━━━━━━━🍓`,
			alreadyDev: `\n🍓━━━━━━━━🍓\n⚠️ 𝗗𝗘́𝗝𝗔 𝗗𝗘𝗩\n%1 utilisateur(s) étaient déjà développeurs:\n%2\n🍓━━━━━━━━🍓`,
			missingIdAdd: `🍓━━━━━━━━🍓\n⚠️ 𝗘𝗥𝗘𝗨𝗥\nVeuillez taguer ou entrer l'ID de l'utilisateur à ajouter\n🍓━━━━━━━━🍓`,
			removed: `🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗣𝗣𝗥𝗘𝗦𝗦𝗜𝗢𝗡 𝗗𝗘𝗩\n\nRôle développeur retiré pour %1 utilisateur(s):\n%2\n🍓━━━━━━━━🍓`,
			notDev: `\n🍓━━━━━━━━🍓\n⚠️ 𝗜𝗡𝗙𝗢\n%1 utilisateur(s) n'étaient pas développeurs:\n%2\n🍓━━━━━━━━🍓`,
			missingIdRemove: `🍓━━━━━━━━🍓\n⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥\n\nVeuillez taguer ou entrer l'ID de l'utilisateur à retirer\n🍓━━━━━━━━🍓`,
			listDev: `🍓━━━━━━━━🍓\n⚙ 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗩\n%1\n🍓━━━━━━━━🍓`
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
						(notDevIds.length > 0? getLang("added", notDevIds.length, getNames.filter(n => notDevIds.includes(n.uid)).map(({ uid, name }) => `• ${name} (${uid})`).join("\n")) : "")
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
				return message.reply(getLang("listDev", getNames.map(({ uid, name }) => `• ${name} (${uid})`).join("\n") || "Aucun développeur"));
			}
			default:
				return message.SyntaxError();
		}
	}
};
