const { getTime } = global.utils;

module.exports = {
	config: {
		name: "warn",
	version: "1.9",
	author: "NTKhang",
		editor: "Camille Uchiha 🍓",
		countDown: 5,
	role: 0,
		description: {
			vi: "cảnh cáo thành viên trong nhóm, đủ 3 lần ban khỏi box",
			en: "warn member in group, if they have 3 warns, they will be banned",
			fr: "Avertir un membre du groupe. 3 avertissements = ban automatique"
	},
		category: "box chat",
	guide: {
			vi: " {pn} @tag <lý do>: dùng cảnh cáo thành viên",
			en: " {pn} @tag <reason>: warn member",
			fr: " {pn} @tag <raison>: Avertir un membre"
				+ "\n {pn} list: Voir la liste des membres avertis"
				+ "\n {pn} listban: Voir la liste des membres bannis"
				+ "\n {pn} info [@tag | <uid> | reply]: Voir les détails des avertissements"
				+ "\n {pn} unban [@tag | <uid>]: Débannir un membre et reset ses warns"
				+ "\n {pn} unwarn [@tag | <uid>] [numéro]: Retirer un avertissement"
				+ "\n {pn} reset: Réinitialiser tous les avertissements"
				+ "\n⚠️ Le bot doit être admin pour kick automatiquement"
	}
	},

	langs: {
	vi: {
			list: "Danh sách những thành viên bị cảnh cáo:\n%1\nĐể xem chi tiết những lần cảnh cáo hãy dùng lệnh \"%2warn info [@tag | <uid> | để trống]\"",
			listBan: "Danh sách những thành viên bị cảnh cáo đủ 3 lần và ban khỏi box:\n%1",
			listEmpty: "Nhóm bạn chưa có thành viên nào bị cảnh cáo",
			listBanEmpty: "Nhóm bạn chưa có thành viên nào bị ban khỏi box",
			invalidUid: "Vui lòng nhập uid hợp lệ của người bạn muốn xem thông tin",
			noData: "Không có dữ liệu nào",
			noPermission: "✗ Chỉ quản trị viên nhóm mới có thể unban thành viên bị ban khỏi box",
			invalidUid2: "⚠ Vui lòng nhập uid hợp lệ của người muốn gỡ ban",
			notBanned: "⚠ Người dùng mang id %1 chưa bị ban khỏi box của bạn",
			unbanSuccess: "✓ Đã gỡ ban thành viên [%1 | %2]",
			noPermission2: "✗ Chỉ quản trị viên nhóm mới có thể gỡ cảnh cáo của thành viên trong nhóm",
			invalidUid3: "⚠ Vui lòng nhập uid hoặc tag người muốn gỡ cảnh cáo",
			noData2: "⚠ Người dùng mang id %1 chưa có dữ liệu cảnh cáo",
			notEnoughWarn: "✗ Người dùng %1 chỉ có %2 lần cảnh cáo",
			unwarnSuccess: "✓ Đã gỡ lần cảnh cáo thứ %1 của thành viên [%2 | %3]",
			noPermission3: "✗ Chỉ quản trị viên nhóm mới có thể reset dữ liệu cảnh cáo",
			resetWarnSuccess: "✓ Đã reset dữ liệu cảnh cáo thành công",
			noPermission4: "✗ Chỉ quản trị viên nhóm mới có thể cảnh cáo thành viên trong nhóm",
			invalidUid4: "⚠ Bạn cần phải tag hoặc phản hồi tin nhắn của người muốn cảnh cáo",
			warnSuccess: "⚠ Đã cảnh cáo thành viên %1 lần %2\n- Uid: %3\n- Lý do: %4\n- Date Time: %5\nThành viên này đã bị cảnh cáo đủ 3 lần và bị ban khỏi box",
			noPermission5: "⚠ Bot cần quyền quản trị viên để kick thành viên bị ban",
			warnSuccess2: "⚠ Đã cảnh cáo thành viên %1 lần %2\n- Uid: %3\n- Lý do: %4\n- Date Time: %5\nNếu vi phạm %6 lần nữa người này sẽ bị ban khỏi box",
			hasBanned: "⚠ Thành viên sau đã bị cảnh cáo đủ 3 lần trước đó và bị ban khỏi box:\n%1",
			failedKick: "⚠ Đã xảy ra lỗi khi kick những thành viên sau:\n%1",
			userNotInGroup: "⚠ Người dùng \"%1\" hiện tại không có trong nhóm của bạn"
	},
	en: {
			list: "List of members who have been warned:\n%1\nTo view the details of the warnings, use the \"%2warn info [@tag | <uid> | leave blank]\" command",
			listBan: "List of members who have been warned 3 times and banned from the box:\n%1",
			listEmpty: "Your group has no members who have been warned",
			listBanEmpty: "Your group has no members banned from the box",
			invalidUid: "Please enter a valid uid of the person you want to view information",
			noData: "No data",
			noPermission: "✗ Only group administrators can unban members banned from the box",
			invalidUid2: "⚠ Please enter a valid uid of the person you want to unban",
			notBanned: "⚠ The user with id %1 has not been banned from your box",
			unbanSuccess: "✓ Successfully unbanned member [%1 | %2]",
			noPermission2: "✗ Only group administrators can remove warnings from members in the group",
			invalidUid3: "⚠ Please enter a uid or tag the person you want to remove the warning",
			noData2: "⚠ The user with id %1 has no warning data",
			notEnoughWarn: "✗ The user %1 only has %2 warnings",
			unwarnSuccess: "✓ Successfully removed the %1 warning of member [%2 | %3]",
			noPermission3: "✗ Only group administrators can reset warning data",
			resetWarnSuccess: "✓ Successfully reset warning data",
			noPermission4: "✗ Only group administrators can warn members in the group",
			invalidUid4: "⚠ You need to tag or reply to the message of the person you want to warn",
			warnSuccess: "⚠ Warned member %1 times %2\n- Uid: %3\n- Reason: %4\n- Date Time: %5\nThis member has been warned 3 times and banned from the box",
			noPermission5: "⚠ Bot needs administrator permissions to kick banned members",
			warnSuccess2: "⚠ Warned member %1 %2 times\n- Uid: %3\n- Reason: %4\n- Date Time: %5\nIf this person violates %6 more times, they will be banned from the box",
			hasBanned: "⚠ The following members have been warned 3 times before and banned from the box:\n%1",
			failedKick: "⚠ An error occurred when kicking the following members:\n%1",
			userNotInGroup: "⚠ The user \"%1\" is currently not in your group"
	},
	fr: {
			list: `🍓━━━━━━━━🍓\n📋 𝗟𝗜𝗦𝗧𝗘 𝗪𝗔𝗥𝗡\n%1\n\n💡 Utilisez "%2warn info @tag" pour voir les détails\n🍓━━━━━━━━🍓`,
			listBan: `🍓━━━━━━━━🍓\n🔨 𝗟𝗜𝗦𝗧𝗘 𝗕𝗔𝗡\n%1\n🍓━━━━━━━━🍓`,
			listEmpty: `🍓━━━━━━━━🍓\n✅ 𝗜𝗡𝗙𝗢\nAucun membre averti dans ce groupe\n🍓━━━━━━━━🍓`,
			listBanEmpty: `🍓━━━━━━━━🍓\n✅ 𝗜𝗡𝗙𝗢\nAucun membre banni dans ce groupe\n🍓━━━━━━━━🍓`,
			invalidUid: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nVeuillez entrer un UID valide\n🍓━━━━━━━━🍓`,
			noData: `Aucun avertissement`,
			noPermission: `🍓━━━━━━━━🍓\n❌ 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡\nSeuls les admins du groupe peuvent débannir\n🍓━━━━━━━━🍓`,
			invalidUid2: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nVeuillez entrer un UID valide pour débannir\n🍓━━━━━━━━🍓`,
			notBanned: `🍓━━━━━━━━🍓\n⚠️ 𝗜𝗡𝗙𝗢\nL'utilisateur %1 n'est pas banni\n🍓━━━━━━━━🍓`,
			unbanSuccess: `🍓━━━━━━━━🍓\n✅ 𝗗𝗘́𝗕𝗔𝗡𝗡𝗜\nMembre [%1 | %2] peut rejoindre le groupe\n🍓━━━━━━━━🍓`,
			noPermission2: `🍓━━━━━━━━🍓\n❌ 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡\nSeuls les admins du groupe peuvent retirer un warn\n🍓━━━━━━━━🍓`,
			invalidUid3: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nVeuillez taguer ou entrer l'UID à unwarn\n🍓━━━━━━━━🍓`,
			noData2: `🍓━━━━━━━━🍓\n⚠️ 𝗜𝗡𝗙𝗢\nL'utilisateur %1 n'a aucun avertissement\n🍓━━━━━━━━🍓`,
			notEnoughWarn: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\n%1 n'a que %2 avertissement(s)\n🍓━━━━━━━━🍓`,
			unwarnSuccess: `🍓━━━━━━━━🍓\n✅ 𝗦𝗨𝗣𝗥𝗜𝗠𝗘́\nWarn n°%1 retiré pour [%2 | %3]\n🍓━━━━━━━━🍓`,
			noPermission3: `🍓━━━━━━━━🍓\n❌ 𝗣𝗘𝗥𝗠𝗜𝗦𝗜𝗢𝗡\nSeuls les admins peuvent reset les warns\n🍓━━━━━━━━🍓`,
			resetWarnSuccess: `🍓━━━━━━━━🍓\n✅ 𝗥𝗘𝗜𝗡𝗜𝗧𝗜𝗔𝗟𝗜𝗦𝗘́\nTous les avertissements ont été supprimés\n🍓━━━━━━━━🍓`,
			noPermission4: `🍓━━━━━━━━🍓\n❌ 𝗣𝗘𝗥𝗠𝗜𝗦𝗜𝗢𝗡\nSeuls les admins peuvent avertir\n🍓━━━━━━━━🍓`,
			invalidUid4: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nVeuillez taguer ou répondre au message de la personne\n🍓━━━━━━━━🍓`,
			warnSuccess: `🍓━━━━━━━━🍓\n🔨 𝗕𝗔𝗡 𝗔𝗨𝗧𝗢\n%1 a reçu son 3ème avertissement\n- 𝗨𝗜𝗗: %3\n- 𝗥𝗮𝗶𝘀𝗼𝗻: %4\n- 𝗗𝗮𝘁𝗲: %5\nIl a été expulsé du groupe\nPour débannir: "%6warn unban %3"\n🍓━━━━━━━━🍓`,
			noPermission5: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nLe bot doit être admin pour expulser\n🍓━━━━━━━━🍓`,
			warnSuccess2: `🍓━━━━━━━━🍓\n⚠️ 𝗔𝗩𝗘𝗥𝗧𝗜𝗦𝗦𝗘𝗠𝗘𝗡𝗧\n%1 - Warn n°%2\n- 𝗨𝗜𝗗: %3\n- 𝗥𝗮𝗶𝘀𝗼𝗻: %4\n- 𝗗𝗮𝘁𝗲: %5\nEncore %6 avertissement(s) et ban automatique\n🍓━━━━━━━━🍓`,
			hasBanned: `🍓━━━━━━━━🍓\n🔨 𝗕𝗔𝗡𝗜𝗦 𝗗𝗘𝗧𝗘𝗖𝗧𝗘𝗦\n%1\nIls ont été expulsés automatiquement\n🍓━━━━━━━━🍓`,
			failedKick: `🍓━━━━━━━━🍓\n❌ 𝗘𝗥𝗘𝗨𝗥\nÉchec d'expulsion:\n%1\n🍓━━━━━━━━🍓`,
			userNotInGroup: `🍓━━━━━━━━🍓\n⚠️ 𝗜𝗡𝗙𝗢\n"%1" n'est plus dans le groupe\n🍓━━━━━━━━🍓`
	}
	},

	onStart: async function ({ message, api, event, args, threadsData, usersData, prefix, role, getLang }) {
		if (!args[0])
			return message.SyntaxError();
		const { threadID, senderID } = event;
		const warnList = await threadsData.get(threadID, "data.warn", []);

		switch (args[0]) {
			case "list": {
				const msg = await Promise.all(warnList.map(async user => {
					const { uid, list } = user;
					const name = await usersData.getName(uid);
					return `• ${name} (${uid}): ${list.length} warn(s)`;
				}));
				message.reply(msg.length? getLang("list", msg.join("\n"), prefix) : getLang("listEmpty"));
				break;
			}
			case "listban": {
				const result = (await Promise.all(warnList.map(async user => {
					const { uid, list } = user;
					if (list.length >= 3) {
						const name = await usersData.getName(uid);
						return `• ${name} (${uid})`;
					}
				}))).filter(item => item);
				message.reply(result.length? getLang("listBan", result.join("\n")) : getLang("listBanEmpty"));
				break;
			}
			case "check":
			case "info": {
				let uids, msg = "";
				if (Object.keys(event.mentions).length)
					uids = Object.keys(event.mentions);
				else if (event.messageReply?.senderID)
					uids = [event.messageReply.senderID];
				else if (args.slice(1).length)
					uids = args.slice(1);
				else
					uids = [senderID];

				if (!uids)
					return message.reply(getLang("invalidUid"));
				msg += (await Promise.all(uids.map(async uid => {
					if (isNaN(uid))
						return null;
					const dataWarnOfUser = warnList.find(user => user.uid == uid);
					let msg = `🆔 UID: ${uid}`;
					const userName = await usersData.getName(uid);

					if (!dataWarnOfUser || dataWarnOfUser.list.length == 0)
						msg += `\n👤 Nom: ${userName}\n${getLang("noData")}`;
					else {
						msg += `\n👤 Nom: ${userName}`
							+ `\n📋 Liste des warns:` + dataWarnOfUser.list.reduce((acc, warn, i) => {
								const { dateTime, reason } = warn;
								return acc + `\n${i+1}. Raison: ${reason}\n Date: ${dateTime}`;
							}, "");
					}
					return msg;
				}))).filter(msg => msg).join("\n\n");
				message.reply(`🍓━━━━━━━━🍓\n${msg}\n🍓━━━━━━━━🍓`);
				break;
			}
			case "unban": {
				if (role < 1)
					return message.reply(getLang("noPermission"));
				let uidUnban;
				if (Object.keys(event.mentions).length)
					uidUnban = Object.keys(event.mentions)[0];
				else if (event.messageReply?.senderID)
					uidUnban = event.messageReply.senderID;
				else if (args.slice(1).length)
					uidUnban = args.slice(1)[0];
				else
					uidUnban = senderID;

				if (!uidUnban || isNaN(uidUnban))
					return message.reply(getLang("invalidUid2"));

				const index = warnList.findIndex(user => user.uid == uidUnban && user.list.length >= 3);
				if (index === -1)
					return message.reply(getLang("notBanned", uidUnban));

				warnList.splice(index, 1);
				await threadsData.set(threadID, warnList, "data.warn");
				const userName = await usersData.getName(uidUnban);
				message.reply(getLang("unbanSuccess", uidUnban, userName));
				break;
			}
			case "unwarn": {
				if (role < 1)
					return message.reply(getLang("noPermission2"));
				let uid, num;
				if (Object.keys(event.mentions)[0]) {
					uid = Object.keys(event.mentions)[0];
					num = args[args.length - 1];
				}
				else if (event.messageReply?.senderID) {
					uid = event.messageReply.senderID;
					num = args[1];
				}
				else {
					uid = args[1];
					num = parseInt(args[2]) - 1;
				}

				if (isNaN(uid))
					return message.reply(getLang("invalidUid3"));

				const dataWarnOfUser = warnList.find(u => u.uid == uid);
				if (!dataWarnOfUser?.list.length)
					return message.reply(getLang("noData2", uid));

				if (isNaN(num))
					num = dataWarnOfUser.list.length - 1;

				const userName = await usersData.getName(uid);
				if (num >= dataWarnOfUser.list.length)
					return message.reply(getLang("notEnoughWarn", userName, dataWarnOfUser.list.length));

				dataWarnOfUser.list.splice(parseInt(num), 1);
				if (!dataWarnOfUser.list.length)
					warnList.splice(warnList.findIndex(u => u.uid == uid), 1);
				await threadsData.set(threadID, warnList, "data.warn");
				message.reply(getLang("unwarnSuccess", num + 1, uid, userName));
				break;
			}
			case "reset": {
				if (role < 1)
					return message.reply(getLang("noPermission3"));
				await threadsData.set(threadID, [], "data.warn");
				message.reply(getLang("resetWarnSuccess"));
				break;
			}
			default: {
				if (role < 1)
					return message.reply(getLang("noPermission4"));
				let reason, uid;
				if (event.messageReply) {
					uid = event.messageReply.senderID;
					reason = args.join(" ").trim();
				}
				else if (Object.keys(event.mentions)[0]) {
					uid = Object.keys(event.mentions)[0];
					reason = args.join(" ").replace(event.mentions[uid], "").trim();
				}
				else {
					return message.reply(getLang("invalidUid4"));
				}
				if (!reason)
					reason = "Aucune raison";
				const dataWarnOfUser = warnList.find(item => item.uid == uid);
				const dateTime = getTime("DD/MM/YYYY hh:mm:ss");
				if (!dataWarnOfUser)
					warnList.push({
						uid,
						list: [{ reason, dateTime, warnBy: senderID }]
					});
				else
					dataWarnOfUser.list.push({ reason, dateTime, warnBy: senderID });

				await threadsData.set(threadID, warnList, "data.warn");

				const times = dataWarnOfUser?.list.length?? 1;

				const userName = await usersData.getName(uid);
				if (times >= 3) {
					message.reply(getLang("warnSuccess", userName, times, uid, reason, dateTime, prefix), () => {
						api.removeUserFromGroup(uid, threadID, async (err) => {
							if (err) {
								const members = await threadsData.get(event.threadID, "members");
								if (members.find(item => item.userID == uid)?.inGroup)
									return message.reply(getLang("userNotInGroup", userName));
								else
									return message.reply(getLang("noPermission5"), (e, info) => {
										const { onEvent } = global.GoatBot;
										onEvent.push({
											messageID: info.messageID,
											onStart: async ({ event }) => {
												if (event.logMessageType === "log:thread-admins" && event.logMessageData.ADMIN_EVENT == "add_admin") {
													const { TARGET_ID } = event.logMessageData;
													if (TARGET_ID == api.getCurrentUserID()) {
														const warnList = await threadsData.get(event.threadID, "data.warn", []);
														if ((warnList.find(user => user.uid == uid)?.list.length?? 0) < 3)
															global.GoatBot.onEvent = onEvent.filter(item => item.messageID!= info.messageID);
														else
															api.removeUserFromGroup(uid, event.threadID, () => global.GoatBot.onEvent = onEvent.filter(item => item.messageID!= info.messageID));
													}
												}
											}
										});
									});
							}
						});
					});
				}
				else
					message.reply(getLang("warnSuccess2", userName, times, uid, reason, dateTime, 3 - (times)));
			}
	}
	},

	onEvent: async ({ event, threadsData, usersData, message, api, getLang }) => {
		const { logMessageType, logMessageData } = event;
		if (logMessageType === "log:subscribe") {
			return async () => {
				const { data, adminIDs } = await threadsData.get(event.threadID);
				const warnList = data.warn || [];
				if (!warnList.length)
					return;
				const { addedParticipants } = logMessageData;
				const hasBanned = [];

				for (const user of addedParticipants) {
					const { userFbId: uid } = user;
					const dataWarnOfUser = warnList.find(item => item.uid == uid);
					if (!dataWarnOfUser)
						continue;
					const { list } = dataWarnOfUser;
					if (list.length >= 3) {
						const userName = await usersData.getName(uid);
						hasBanned.push({
							uid,
							name: userName
						});
					}
				}

				if (hasBanned.length) {
					await message.send(getLang("hasBanned", hasBanned.map(item => `• ${item.name} (${item.uid})`).join("\n")));
					if (!adminIDs.includes(api.getCurrentUserID()))
						message.reply(getLang("noPermission5"), (e, info) => {
							const { onEvent } = global.GoatBot;
							onEvent.push({
								messageID: info.messageID,
								onStart: async ({ event }) => {
									if (
										event.logMessageType === "log:thread-admins"
										&& event.logMessageData.ADMIN_EVENT == "add_admin"
										&& event.logMessageData.TARGET_ID == api.getCurrentUserID()
									) {
										const threadData = await threadsData.get(event.threadID);
										const warnList = threadData.data.warn;
										const members = threadData.members;
										removeUsers(hasBanned, warnList, api, event, message, getLang, members);
										global.GoatBot.onEvent = onEvent.filter(item => item.messageID!= info.messageID);
									}
								}
							});
						});
					else {
						const members = await threadsData.get(event.threadID, "members");
						removeUsers(hasBanned, warnList, api, event, message, getLang, members);
					}
				}
			};
	}
	}
};

async function removeUsers(hasBanned, warnList, api, event, message, getLang, members) {
	const failed = [];
	for (const user of hasBanned) {
		if (members.find(item => item.userID == user.uid)?.inGroup) {
			try {
				if (warnList.find(item => item.uid == user.uid)?.list.length?? 0 >= 3)
					await api.removeUserFromGroup(user.uid, event.threadID);
			}
			catch (e) {
				failed.push({
					uid: user.uid,
					name: user.name
				});
			}
	}
	}
	if (failed.length)
		message.reply(getLang("failedKick", failed.map(item => `• ${item.name} (${item.uid})`).join("\n")));
}
