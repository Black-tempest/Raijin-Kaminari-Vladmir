module.exports = {
	// Tu peux custom la langue ici ou direct dans les fichiers de commandes
	onlyadminbox: {
		description: "Activer/désactiver: seul l'admin du groupe peut utiliser le bot",
	guide: " {pn} [on | off]",
		text: {
			turnedOn: "Mode activé: seul l'admin du groupe peut utiliser le bot",
			turnedOff: "Mode désactivé: tout le monde peut utiliser le bot",
			syntaxError: "Erreur de syntaxe, utilise seulement {pn} on ou {pn} off"
	}
	},
	adduser: {
		description: "Ajouter un membre dans ton groupe",
	guide: " {pn} [lien profil | uid]",
		text: {
			alreadyInGroup: "Déjà dans le groupe",
			successAdd: "- %1 membre(s) ajouté(s) au groupe avec succès",
			failedAdd: "- Échec de l'ajout de %1 membre(s) au groupe",
			approve: "- %1 membre(s) ajouté(s) à la liste d'approbation",
			invalidLink: "Entre un lien Facebook valide",
			cannotGetUid: "Impossible d'obtenir l'uid de cet utilisateur",
			linkNotExist: "Ce lien de profil n'existe pas",
			cannotAddUser: "Le bot est bloqué ou cet utilisateur bloque les inconnus"
	}
	},
	admin: {
		description: "Ajouter, retirer, voir les admins du bot",
	guide: " {pn} [add | -a] <uid>: Ajouter admin\n\t {pn} [remove | -r] <uid>: Retirer admin\n\t {pn} [list | -l]: Liste des admins",
		text: {
			added: "✅ | Admin ajouté pour %1 utilisateur(s):\n%2",
			alreadyAdmin: "\n⚠️ | %1 utilisateur(s) sont déjà admin:\n%2",
			missingIdAdd: "⚠️ | Entre un ID ou tag pour ajouter admin",
			removed: "✅ | Admin retiré pour %1 utilisateur(s):\n%2",
			notAdmin: "⚠️ | %1 utilisateur(s) ne sont pas admin:\n%2",
			missingIdRemove: "⚠️ | Entre un ID ou tag pour retirer admin",
			listAdmin: "👑 | Liste des admins:\n%1"
	}
	},
	adminonly: {
		description: "Activer/désactiver: seul l'admin peut utiliser le bot",
	guide: "{pn} [on | off]",
		text: {
			turnedOn: "Mode admin uniquement activé",
			turnedOff: "Mode admin uniquement désactivé",
			syntaxError: "Erreur de syntaxe, utilise seulement {pn} on ou {pn} off"
	}
	},
	all: {
		description: "Tag tout le monde dans ton groupe",
	guide: "{pn} [message | vide]"
	},
	anime: {
		description: "Image anime aléatoire",
	guide: "{pn} <endpoint>\n Liste: neko, kitsune, hug, pat, waifu, cry, kiss, slap, smug, punch",
		text: {
			loading: "Chargement de l'image, patiente...",
			error: "Une erreur est survenue, réessaie plus tard"
	}
	},
	antichangeinfobox: {
		description: "Activer/désactiver anti changement d'info du groupe",
	guide: " {pn} avt [on | off]: anti changement avatar\n {pn} name [on | off]: anti changement nom\n {pn} theme [on | off]: anti changement thème\n {pn} emoji [on | off]: anti changement emoji",
		text: {
			antiChangeAvatarOn: "Anti changement avatar activé",
			antiChangeAvatarOff: "Anti changement avatar désactivé",
			missingAvt: "Tu n'as pas défini d'avatar pour le groupe",
			antiChangeNameOn: "Anti changement nom activé",
			antiChangeNameOff: "Anti changement nom désactivé",
			antiChangeThemeOn: "Anti changement thème activé",
			antiChangeThemeOff: "Anti changement thème désactivé",
			antiChangeEmojiOn: "Anti changement emoji activé",
			antiChangeEmojiOff: "Anti changement emoji désactivé",
			antiChangeAvatarAlreadyOn: "Anti avatar déjà activé",
			antiChangeNameAlreadyOn: "Anti nom déjà activé",
			antiChangeThemeAlreadyOn: "Anti thème déjà activé",
			antiChangeEmojiAlreadyOn: "Anti emoji déjà activé"
	}
	},
	appstore: {
		description: "Recher une app sur AppStore",
		text: {
			missingKeyword: "Tu n'as entré aucun mot-clé",
			noResult: "Aucun résultat pour %1"
	}
	},
	autosetname: {
		description: "Change auto le pseudo des nouveaux membres",
	guide: " {pn} set <pseudo>: Config auto pseudo\n Raccourcis: {userName}, {userID}\n Ex: {pn} set {userName} 🚀\n\n {pn} [on | off]: Activer/désactiver\n {pn} [view | info]: Voir config",
		text: {
			missingConfig: "Entre la config requise",
			configSuccess: "Config définie avec succès",
			currentConfig: "Config autoSetName actuelle:\n%1",
			notSetConfig: "Aucune config définie",
			syntaxError: "Erreur: utilise seulement \"{pn} on\" ou \"{pn} off\"",
			turnOnSuccess: "AutoSetName activé",
			turnOffSuccess: "AutoSetName désactivé",
			error: "Erreur lors de l'utilisation, désactive le lien d'invitation et réessaie"
	}
	},
	avatar: {
		description: "Créer avatar anime avec signature",
	guide: "{p}{n} <id nom> | <texte fond> | <signature> | <couleur>\n{p}{n} help: aide",
		text: {
			initImage: "Création de l'image, patiente...",
			invalidCharacter: "Il y a seulement %1 personnages, id < %2",
			notFoundCharacter: "Aucun personnage nommé %1",
			errorGetCharacter: "Erreur données personnage:\n%1: %2",
			success: "✅ Ton avatar\nPerso: %1\nID: %2\nTexte: %3\nSignature: %4\nCouleur: %5",
			defaultColor: "défaut",
			error: "Erreur\n%1: %2"
	}
	},
	badwords: {
		description: "Activer/gérer les mots interdits. 1er warn, 2ème kick",
	guide: " {pn} add <mots>: Ajouter\n {pn} delete <mots>: Supprimer\n {pn} list <hide>: Liste\n {pn} unwarn <@tag>: Retirer 1 warn\n {pn} on/off: Activer/désactiver",
		text: {
			onText: "activé",
			offText: "désactivé",
			onlyAdmin: "⚠️ | Seul l'admin peut ajouter des mots",
			missingWords: "⚠️ | Entre les mots interdits",
			addedSuccess: "✅ | %1 mot(s) ajouté(s)",
			alreadyExist: "❌ | %1 mot(s) existent déjà: %2",
			tooShort: "⚠️ | %1 mot(s) trop court: %2",
			onlyAdmin2: "⚠️ | Seul l'admin peut supprimer",
			missingWords2: "⚠️ | Entre les mots à supprimer",
			deletedSuccess: "✅ | %1 mot(s) supprimé(s)",
			notExist: "❌ | %1 mot(s) n'existent pas: %2",
			emptyList: "⚠️ | Liste vide",
			badWordsList: "📑 | Mots interdits: %1",
			onlyAdmin3: "⚠️ | Seul l'admin peut %1",
			turnedOnOrOff: "✅ | Warn mots interdits %1",
			onlyAdmin4: "⚠️ | Seul l'admin peut retirer un warn",
			missingTarget: "⚠️ | Tag ou entre un ID",
			notWarned: "⚠️ | %1 n'a aucun warn",
			removedWarn: "✅ | 1 warn retiré à %1 | %2",
			warned: "⚠️ | Mot \"%1\" détecté. 2ème fois = kick.",
			warned2: "⚠️ | Mot \"%1\" détecté. 2ème warn = kick.",
			needAdmin: "Le bot a besoin d'être admin pour kick",
			unwarned: "✅ | Warn retiré à %1 | %2"
	}
	},
	balance: {
		description: "Voir ton argent ou celui de quelqu'un",
		guide: " {pn}: ton argent\n {pn} <@tag>: argent du tag",
		text: {
			money: "Tu as %1$",
			moneyOf: "%1 a %2$"
	}
	},
	batslap: {
		description: "Image gifle",
		text: {
			noTag: "Tag la personne à gifler"
	}
	},
	busy: {
		description: "Mode ne pas déranger",
	guide: " {pn} [raison]: Activer\n {pn} off: Désactiver",
		text: {
			turnedOff: "✅ | Mode NPD désactivé",
			turnedOn: "✅ | Mode NPD activé",
			turnedOnWithReason: "✅ | Mode NPD activé: %1",
			alreadyOn: "%1 est occupé",
			alreadyOnWithReason: "%1 est occupé: %2"
	}
	},
	callad: {
		description: "Envoyer un rapport/bug à l'admin du bot",
	guide: " {pn} <message>",
		text: {
			missingMessage: "Entre ton message pour l'admin",
			sendByGroup: "\n- Envoyé depuis: %1\n- ID: %2",
			sendByUser: "\n- Envoyé par un utilisateur",
			content: "\n\nContenu:\n─────────────────\n%1\n─────────────────\nRéponds à ce message",
			success: "Message envoyé à l'admin!",
			reply: "📍 Réponse admin %1:\n─────────────────\n%2\n─────────────────\nRéponds pour continuer",
			replySuccess: "Réponse envoyée à l'admin!",
			feedback: "📝 Retour de %1:\n- ID: %2%3\nContenu:\n─────────────────\n%4\n─────────────────\nRéponds pour répondre",
			replyUserSuccess: "Réponse envoyée à l'utilisateur!"
	}
	},
	cmd: {
		description: "Gérer tes fichiers de commandes",
	guide: "{pn} load <nom>\n{pn} loadAll\n{pn} install <url> <nom>",
		text: {
			missingFileName: "⚠️ | Entre le nom de la commande",
			loaded: "✅ | Commande \"%1\" chargée",
			loadedError: "❌ | Échec chargement \"%1\"\n%2: %3",
			loadedSuccess: "✅ | \"%1\" chargée",
			loadedFail: "❌ | Échec \"%1\"\n%2",
			missingCommandNameUnload: "⚠️ | Entre la commande à décharger",
			unloaded: "✅ | \"%1\" déchargée",
			unloadedError: "❌ | Échec déchargement \"%1\"\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Entre url et nom de fichier",
			missingUrlOrCode: "⚠️ | Entre l'url ou le code",
			missingFileNameInstall: "⚠️ | Entre le nom.js",
			invalidUrlOrCode: "⚠️ | Code introuvable",
			alreadExist: "⚠️ | Fichier existe déjà. Réagis pour écraser",
			installed: "✅ | \"%1\" installée à %2",
			installedError: "❌ | Échec install \"%1\"\n%2: %3",
			missingFile: "⚠️ | Fichier \"%1\" introuvable",
			invalidFileName: "⚠️ | Nom invalide",
			unloadedFile: "✅ | \"%1\" déchargée"
	}
	},
	count: {
		description: "Voir le nombre de messages",
	guide: " {pn}: toi\n {pn} @tag: quelqu'un\n {pn} all: tout le monde",
		text: {
			count: "Nombre de messages:",
			endMessage: "Ceux sans nom n'ont rien envoyé.",
			page: "Page [%1/%2]",
			reply: "Réponds avec le numéro de page",
			result: "%1 est %2ème avec %3 messages",
			yourResult: "Tu es %1ème avec %2 messages",
			invalidPage: "Page invalide"
	}
	},
	customrankcard: {
		description: "Custom ta carte de rank",
	guide: {
			body: " {pn} [couleur] <valeur>\n maincolor, subcolor, linecolor, expbarcolor, etc.\n {pn} reset: reset",
			attachment: {
				[`${process.cwd()}/scripts/cmds/assets/guide/customrankcard_1.jpg`]: "https://i.ibb.co/BZ2Qgs1/image.png",
				[`${process.cwd()}/scripts/cmds/assets/guide/customrankcard_2.png`]: "https://i.ibb.co/wy1ZHHL/image.png"
			}
	},
		text: {
			invalidImage: "Url image invalide. Utilise imgbb.com",
			invalidAttachment: "Fichier image invalide",
			invalidColor: "Code couleur invalide",
			notSupportImage: "Image non supportée pour \"%1\"",
			success: "Modifs enregistrées, aperçu:",
			reseted: "Reset effectué",
			invalidAlpha: "Entre 0 et 1"
		}
	},
	dhbc: {
		description: "Jeu: devine le mot",
	guide: "{pn}",
		text: {
			reply: "Réponds à ce message:\n%1",
			isSong: "C'est le titre de %1",
			notPlayer: "⚠️ Tu ne joues pas",
			correct: "🎉 Bonne réponse! +%1$",
			wrong: "⚠️ Mauvaise réponse"
	}
	},
	emojimix: {
		description: "Mixer 2 emojis",
	guide: " {pn} <emoji1> <emoji2>\n Ex: {pn} 🤣 🥰"
	},
	eval: {
		description: "Tester du code rapidement",
	guide: "{pn} <code>",
		text: {
			error: "❌ Erreur:"
	}
	},
	event: {
		description: "Gérer tes fichiers d'event",
	guide: "{pn} load <nom>\n{pn} loadAll\n{pn} install <url> <nom>",
		text: {
			missingFileName: "⚠️ | Entre le nom",
			loaded: "✅ | Event \"%1\" chargé",
			loadedError: "❌ | Échec \"%1\"\n%2: %3",
			loadedSuccess: "✅ | \"%1\" chargé",
			loadedFail: "❌ | Échec \"%1\"\n%2",
			missingCommandNameUnload: "⚠️ | Entre le nom à décharger",
			unloaded: "✅ | \"%1\" déchargé",
			unloadedError: "❌ | Échec \"%1\"\n%2: %3",
			missingUrlCodeOrFileName: "⚠️ | Entre url et nom",
			missingUrlOrCode: "⚠️ | Entre l'url ou code",
			missingFileNameInstall: "⚠️ | Entre le nom.js",
			invalidUrlOrCode: "⚠️ | Code introuvable",
			alreadExist: "⚠️ | Fichier existe. Réagis pour écraser",
			installed: "✅ | \"%1\" installé à %2",
			installedError: "❌ | Échec \"%1\"\n%2: %3",
			missingFile: "⚠️ | Fichier \"%1\" introuvable",
			invalidFileName: "⚠️ | Nom invalide",
			unloadedFile: "✅ | \"%1\" déchargé"
	}
	},
	filteruser: {
		description: "Filtrer les membres inactifs ou comptes bloqués",
	guide: " {pn} [<nombre msgs> | die]",
		text: {
			needAdmin: "⚠️ | Mets le bot admin",
			confirm: "⚠️ | Kick les < %1 msgs?\nRéagis pour confirmer",
			kickByBlock: "✅ | %1 comptes bloqués kick",
			kickByMsg: "✅ | %1 membres < %2 msgs kick",
			kickError: "❌ | Erreur kick %1:\n%2",
			noBlock: "✅ | Aucun compte bloqué",
			noMsg: "✅ | Aucun membre < %1 msgs"
	}
	},
	getfbstate: {
		description: "Récupérer ton fbstate",
	guide: "{pn}",
		text: {
			success: "Fbstate envoyé en PV"
	}
	},
	grouptag: {
		description: "Tag par groupe",
	guide: " {pn} add <nom> @tag\n {pn} del <nom> @tag\n {pn} remove <nom>\n {pn} rename <nom> | <new>\n {pn} list\n {pn} info <nom>",
		text: {
			noGroupTagName: "Entre un nom de groupe",
			noMention: "Tag des membres",
			addedSuccess: "Ajouté:\n%1\nà \"%2\"",
			addedSuccess2: "Groupe \"%1\" créé:\n%2",
			existedInGroupTag: "Déjà dans \"%2\":\n%1",
			notExistedInGroupTag: "Pas dans \"%2\":\n%1",
			noExistedGroupTag: "\"%1\" n'existe pas",
			noExistedGroupTag2: "Aucun groupe tag",
			noMentionDel: "Tag à retirer de \"%1\"",
			deletedSuccess: "Retiré:\n%1\nde \"%2\"",
			deletedSuccess2: "\"%1\" supprimé",
			tagged: "Groupe \"%1\":\n%2",
			noGroupTagName2: "Entre ancien | nouveau nom",
			renamedSuccess: "\"%1\" → \"%2\"",
			infoGroupTag: "📑 | Nom: \"%1\"\n👥 | Membres: %2\n👨‍👩‍👧‍👦 | Liste:\n %3"
	}
	},
	help: {
		description: "Voir l'aide des commandes",
	guide: "{pn} [page | <nom>]",
		text: {
			help: "Commandes:\n%1\nPage %2/%3 • Total: %4\n- {pn}help <page>\n- {pn}help <commande>\n%6",
			help2: "%1Total: %2\n- {pn}help <commande>\n%4",
			commandNotFound: "\"%1\" n'existe pas",
			getInfoCommand: "Nom: %1\nDesc: %2\nAlias: %3\nAlias Groupe: %4\nVersion: %5\nRôle: %6\nCooldown: %7s\nAuteur: %8\nUsage:\n%9\n<> = requis, [] = choix",
			doNotHave: "Aucun",
			roleText0: "0 (Tous)",
			roleText1: "1 (Admins groupe)",
			roleText2: "2 (Admin bot)",
			roleText0setRole: "0 (Tous)",
			roleText1setRole: "1 (Admins groupe)",
			pageNotFound: "Page %1 inexistante"
	}
	},
	kick: {
		description: "Kick un membre",
	guide: "{pn} @tag"
	},
	loadconfig: {
		description: "Recharger la config du bot"
	},
	moon: {
		description: "Voir la lune à une date",
	guide: " {pn} <jj/mm/aaaa> [texte]",
		text: {
			invalidDateFormat: "Format JJ/MM/AAAA requis",
			error: "Erreur lune %1",
			invalidDate: "%1 invalide",
			caption: "- Lune du %1"
	}
	},
	notification: {
		description: "Envoyer notif admin à tous les groupes",
	guide: "{pn} <message>",
		text: {
			missingMessage: "Entre le message",
			notification: "Notif admin à tous les groupes",
			sendingNotification: "Envoi à %1 groupes...",
			sentNotification: "✅ Envoyé à %1 groupes",
			errorSendingNotification: "Erreur envoi %1 groupes:\n %2"
	}
	},
	prefix: {
		description: "Changer le préfixe du bot",
	guide: " {pn} <new> : ce groupe\n {pn} <new> -g: tout le bot\n {pn} reset: par défaut",
		text: {
			reset: "Préfixe reset: %1",
			onlyAdmin: "Seul admin peut changer le préfixe global",
			confirmGlobal: "Réagis pour confirmer changement global",
			confirmThisThread: "Réagis pour confirmer ici",
			successGlobal: "Préfixe global: %1",
			successThisThread: "Préfixe ici: %1",
			myPrefix: "🌐 Global: %1\n🛸 Ici: %2"
	}
	},
	rank: {
		description: "Voir ton niveau ou celui d'un autre"
	},
	rankup: {
		description: "Activer/désactiver notif niveau",
	guide: "{pn} [on | off]",
		text: {
			syntaxError: "Erreur: {pn} on ou off",
			turnedOn: "Notif niveau activée",
			turnedOff: "Notif niveau désactivée",
			notiMessage: "🎉 Niveau %1 atteint!"
	}
	},
	refresh: {
		description: "Rafraîchir infos groupe/user",
	guide: " {pn} [thread | group]\n {pn} group <tid>\n {pn} user [<uid> | @tag]",
		text: {
			refreshMyThreadSuccess: "✅ | Groupe rafraîchi!",
			refreshThreadTargetSuccess: "✅ | %1 rafraîchi!"
	}
	},
	rules: {
		description: "Gérer les règles du groupe",
	guide: " {pn} [add | -a] <règle>\n {pn}: voir\n {pn} [edit | -e] <n> <texte>\n {pn} [move | -m] <n1> <n2>\n {pn} [delete | -d] <n>\n {pn} [remove | -r]"
	},
	sendnoti: {
		description: "Envoyer notif à tes groupes",
	guide: " {pn} create <nom>\n {pn} add <nom>\n {pn} delete <nom>\n {pn} send <nom> | <msg>\n {pn} remove <nom>",
		text: {
			missingGroupName: "Entre un nom",
			groupNameExists: "\"%1\" existe déjà",
			createdGroup: "Groupe créé:\n- Nom: %1\n- ID: %2",
			missingGroupNameToAdd: "Entre le nom",
			groupNameNotExists: "\"%1\" n'existe pas",
			notAdmin: "Tu n'es pas admin ici",
			added: "Groupe ajouté à: %1",
			missingGroupNameToDelete: "Entre le nom",
			notInGroup: "Pas dans %1",
			deleted: "Groupe retiré de: %1",
			failed: "Échec envoi %1 groupes:\n%2",
			missingGroupNameToRemove: "Entre le nom",
			removed: "Groupe %1 supprimé",
			missingGroupNameToSend: "Entre le nom",
			groupIsEmpty: "\"%1\" est vide",
			sending: "Envoi à %1 groupes...",
			success: "Envoyé à %1 groupes \"%2\"",
			notAdminOfGroup: "Pas admin ici",
			missingGroupNameToView: "Entre le nom",
			groupInfo: "- Nom: %1\n - ID: %2\n - Créé: %3\n%4 ",
			groupInfoHasGroup: "- Groupes:\n%1",
			noGroup: "Aucun groupe créé"
	}
	},
	setalias: {
		description: "Ajouter un alias à une commande",
	guide: " {pn} add <alias> <cmd>\n {pn} add <alias> <cmd> -g\n {pn} rm <alias> <cmd>\n {pn} list\n {pn} list -g"
	},
	setavt: {
		description: "Changer avatar du bot",
		text: {
			cannotGetImage: "❌ | Erreur image",
			invalidImageFormat: "❌ | Format invalide",
			changedAvatar: "✅ | Avatar changé"
	}
	},
	setlang: {
		description: "Changer la langue du bot",
	guide: " {pn} <code>\n Ex: {pn} fr {pn} en",
		text: {
			setLangForAll: "Langue globale: %1",
			setLangForCurrent: "Langue ici: %1",
			noPermission: "Seul admin bot peut"
	}
	},
	setleave: {
		description: "Message de départ",
	guide: {
			body: " {pn} on/off\n {pn} text <texte> | reset\n Raccourcis: {userName}, {boxName}, {type}\n {pn} file: ajouter image",
			attachment: {
				[`${process.cwd()}/scripts/cmds/assets/guide/setleave/setleave_en_1.png`]: "https://i.ibb.co/2FKJHJr/guide1.png"
			}
	},
		text: {
			missingContent: "Entre un texte",
			edited: "Message départ modifié:\n%1",
			reseted: "Message reset",
			noFile: "Aucun fichier",
			resetedFile: "Fichier reset",
			missingFile: "Réponds avec image/vidéo/audio",
			addedFile: "%1 fichier ajouté"
	}
	},
	setname: {
		description: "Changer pseudo des membres",
	guide: {
			body: " {pn} <pseudo>: toi\n {pn} @tag <pseudo>\n {pn} all <pseudo>\n Raccourcis: {userName}, {userID}",
			attachment: {
				[`${process.cwd()}/scripts/cmds/assets/guide/setname_1.png`]: "https://i.ibb.co/gFh23zb/guide1.png",
				[`${process.cwd()}/scripts/cmds/assets/guide/setname_2.png`]: "https://i.ibb.co/BNWHKgj/guide2.png"
			}
	},
		text: {
			error: "Erreur. Désactive le lien d'invitation"
	}
	},
	setrole: {
		description: "Changer le rôle d'une commande",
	guide: " {pn} <cmd> <role>\n 0=Tous, 1=Admin, default=reset\n {pn} viewrole",
		text: {
			noEditedCommand: "✅ Aucune commande modifiée",
			editedCommand: "⚠️ Commandes modifiées:\n",
			noPermission: "❗ Admin seulement",
			commandNotFound: "\"%1\" introuvable",
			noChangeRole: "❗ Rôle non modifiable",
			resetRole: "Rôle \"%1\" reset",
			changedRole: "Rôle \"%1\" = %2"
	}
	},
	setwelcome: {
		description: "Message de bienvenue",
	guide: {
			body: " {pn} text <texte> | reset\n Raccourcis: {userName}, {boxName}\n {pn} file: ajouter image",
			attachment: {
				[`${process.cwd()}/scripts/cmds/assets/guide/setwelcome/setwelcome_en_1.png`]: "https://i.ibb.co/vsCz0ks/setwelcome-en-1.png"
			}
	},
		text: {
			missingContent: "Entre un texte",
			edited: "Bienvenue modifié: %1",
			reseted: "Bienvenue reset",
			noFile: "Aucun fichier",
			resetedFile: "Fichier reset",
			missingFile: "Réponds avec image/vidéo/audio",
			addedFile: "%1 fichier ajouté"
	}
	},
	shortcut: {
		description: "Raccourci message",
		text: {
			missingContent: 'Entre le message',
			shortcutExists: '"%1" existe. Réagis pour remplacer',
			shortcutExistsByOther: '%1 existe déjà',
			added: '%1 => %2',
			addedAttachment: ' avec %1 fichier(s)',
			missingKey: 'Entre le mot-clé à supprimer',
			notFound: 'Aucun raccourci %1',
			onlyAdmin: 'Admin seulement',
			deleted: '%1 supprimé',
			empty: 'Aucun raccourci',
			message: 'Message',
			attachment: 'Fichier',
			list: 'Tes raccourcis',
			onlyAdminRemoveAll: 'Admin seulement',
			confirmRemoveAll: 'Supprimer tout? Réagis',
			removedAll: 'Tout supprimé'
	}
	},
	simsimi: {
		description: "Chat avec Simsimi",
	guide: " {pn} [on | off]\n {pn} <texte>",
		text: {
			turnedOn: "Simsimi activé!",
			turnedOff: "Simsimi désactivé!",
			chatting: "Chat avec Simsimi...",
			error: "Simsimi occupé"
	}
	},
	sorthelp: {
		description: "Trier la liste help",
	guide: "{pn} [name | category]",
		text: {
			savedName: "Tri par nom enregistré",
			savedCategory: "Tri par catégorie enregistré"
	}
	},
	thread: {
		description: "Gérer les groupes du bot",
	guide: " {pn} [find | -f] <nom>\n {pn} [ban | -b] <tid> <raison>\n {pn} unban <tid>",
		text: {
			noPermission: "Pas la permission",
			found: "🔎 %1 groupe(s) \"%2\":\n%3",
			notFound: "❌ Aucun groupe \"%1\"",
			hasBanned: "Groupe [%1 | %2] banni:\n» Raison: %3\n» Date: %4",
			banned: "Groupe [%1 | %2] banni.\n» Raison: %3\n» Date: %4",
			notBanned: "Groupe [%1 | %2] pas banni",
			unbanned: "Groupe [%1 | %2] débanni",
			missingReason: "Raison requise",
			info: "» ID: %1\n» Nom: %2\n» Créé: %3\n» Membres: %4\n» H: %5\n» F: %6\n» Msgs: %7%8"
	}
	},
	tid: {
		description: "Voir l'ID de ton groupe",
	guide: "{pn}"
	},
	tik: {
		description: "Télécharger vidéo/audio TikTok",
	guide: " {pn} [video|-v] <url>\n {pn} [audio|-a] <url>",
		text: {
			invalidUrl: "Url TikTok invalide",
			downloadingVideo: "Téléchargement: %1...",
			downloadedSlide: "Slide: %1\n%2",
			downloadedVideo: "Vidéo: %1\nLien: %2",
			downloadingAudio: "Audio: %1...",
			downloadedAudio: "Audio: %1"
	}
	},
	trigger: {
		description: "Image trigger",
	guide: "{pn} [@tag]"
	},
	uid: {
		description: "Voir l'ID Facebook",
	guide: " {pn}\n {pn} @tag\n {pn} <lien>",
		text: {
			syntaxError: "Tag quelqu'un ou laisse vide pour toi"
	}
	},
	unsend: {
		description: "Supprimer message du bot",
	guide: "Réponds au message + {pn}",
		text: {
			syntaxError: "Réponds au message à supprimer"
	}
	},
	user: {
		description: "Gérer les users du bot",
	guide: " {pn} [find | -f] <nom>\n {pn} [ban | -b] <uid> <raison>\n {pn} unban <uid>",
		text: {
			noUserFound: "❌ Aucun user \"%1\"",
			userFound: "🔎 %1 user \"%2\":\n%3",
			uidRequired: "UID requis",
			reasonRequired: "Raison requise",
			userHasBanned: "User [%1 | %2] banni:\n» Raison: %3\n» Date: %4",
			userBanned: "User [%1 | %2] banni:\n» Raison: %3\n» Date: %4",
			uidRequiredUnban: "UID requis",
			userNotBanned: "User [%1 | %2] pas banni",
			userUnbanned: "User [%1 | %2] débanni"
	}
	},
	videofb: {
		description: "Télécharger vidéo Facebook public",
	guide: " {pn} <url>",
		text: {
			missingUrl: "Entre l'url",
			error: "Erreur téléchargement",
			downloading: "Téléchargement...",
			tooLarge: "Vidéo > 83MB"
	}
	},
	warn: {
		description: "Warn un membre. 3 warns = ban",
	guide: " {pn} @tag <raison>\n {pn} list\n {pn} listban\n {pn} info [@tag]\n {pn} unban <uid>\n {pn} unwarn <uid>\n {pn} warn reset",
		text: {
			list: "Membres warn:\n%1\n{pn}warn info pour détails",
			listBan: "Membres bannis 3 warns:\n%1",
			listEmpty: "Aucun warn",
			listBanEmpty: "Aucun banni",
			invalidUid: "UID invalide",
			noData: "Aucune donnée",
			noPermission: "❌ Admin seulement",
			invalidUid2: "⚠️ UID invalide",
			notBanned: "⚠️ %1 pas banni",
						unbanSuccess: "✅ | %1 | %2 débanni. Il peut revenir",
			noPermission2: "❌ | Seul admin peut retirer un warn",
			invalidUid3: "⚠️ | Tag ou entre un UID",
			noData2: "⚠️ | %1 n'a aucun warn",
			notEnoughWarn: "❌ | %1 a seulement %2 warn(s)",
			unwarnSuccess: "✅ | Warn %1 retiré à [%2 | %3]",
			noPermission3: "❌ | Seul admin peut reset",
			resetWarnSuccess: "✅ | Tous les warns reset",
			noPermission4: "❌ | Seul admin peut warn",
			invalidUid4: "⚠️ | Tag ou réponds au msg",
			warnSuccess: "⚠️ | %1 warn %2\n- UID: %3\n- Raison: %4\n- Date: %5\n3/3 = BAN. Déban: {pn}warn unban <uid>",
			noPermission5: "⚠️ | Le bot doit être admin pour kick",
			warnSuccess2: "⚠️ | %1 warn %2\n- UID: %3\n- Raison: %4\n- Date: %5\nEncore %6 warn = BAN",
			hasBanned: "⚠️ | Déjà banni 3 fois:\n%1",
			failedKick: "⚠️ | Erreur kick:\n%1"
	}
	},
	weather: {
		description: "Météo actuelle + 5 jours",
	guide: "{pn} <ville>",
		text: {
			syntaxError: "Entre une ville",
			notFound: "Ville introuvable: %1",
			error: "Erreur: %1",
			today: "Météo du jour:\n%1\n🌡 Min-Max: %2°C - %3°C\n🌡 Ressenti: %4°C - %5°C\n🌅 Lever: %6\n🌄 Coucher: %7\n🌃 Lune: %8\n🏙️ Lune: %9\n🌞 Jour: %10\n🌙 Nuit: %11"
	}
	},
	ytb: {
		description: "Télécharger vidéo/audio YouTube ou voir infos",
	guide: " {pn} [video|-v] <nom|lien>\n {pn} [audio|-a] <nom|lien>\n {pn} [info|-i] <nom|lien>",
		text: {
			error: "Erreur: %1",
			noResult: "Aucun résultat pour %1",
			choose: "%1Réponds avec le numéro ou n'importe quoi pour annuler",
			downloading: "Téléchargement vidéo %1",
			noVideo: "Désolé, aucune vidéo < 83MB",
			downloadingAudio: "Téléchargement audio %1",
			noAudio: "Désolé, aucun audio < 26MB",
			info: "💠 Titre: %1\n🏪 Chaîne: %2\n👨‍👩‍👧‍👦 Abonnés: %3\n⏱ Durée: %4\n👀 Vues: %5\n👍 Likes: %6\n🆙 Date: %7\n🔠 ID: %8\n🔗 Lien: %9",
			listChapter: "\n📖 Chapitres: %1\n"
		}
	}
};
