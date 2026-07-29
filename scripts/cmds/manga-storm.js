module.exports = {
    config: {
        name: "manga-storm",
        version: "1.0",
        author: "Veldora Tempest",
        countDown: 5,
        role: 0,
        shortDescription: "Jeu de combat Manga Storm",
        longDescription: "Un jeu de combat en tour par tour dans l'univers des mangas. Affrontez un autre joueur ou le bot avec des personnages iconiques.",
        category: "jeux",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, message }) {
        const threadID = event.threadID;
        const senderID = event.senderID;

        if (global.mangaStormSessions && global.mangaStormSessions.has(threadID)) {
            return message.reply("Une partie est déjà en cours dans ce groupe. Terminez-la d'abord.");
        }

        const session = {
            threadID,
            player1: null,
            player2: null,
            mode: null, // 'multi' ou 'bot'
            step: 'chooseMode', // étapes: chooseMode, waitStart, waitPlayerIDs, chooseChar1, chooseChar2, battle
            expectedUser: senderID, // celui qui a tapé la commande
            player1Char: null,
            player2Char: null,
            player1PV: 0,
            player1PE: 0,
            player2PV: 0,
            player2PE: 0,
            currentTurn: 1, // 1 ou 2
            lastMessageID: null
        };

        if (!global.mangaStormSessions) global.mangaStormSessions = new Map();
        global.mangaStormSessions.set(threadID, session);

        const msg = await message.reply("⚔️ 𝐌𝐀𝐍𝐆𝐀-𝐒𝐓𝐎𝐑𝐌 ⚔️\n\nChoisissez le mode :\n1️⃣ Multijoueur (tapez 'multi')\n2️⃣ Contre le bot (tapez 'bot')");
        session.lastMessageID = msg.messageID;
    },

    onChat: async function ({ api, event }) {
        const threadID = event.threadID;
        const senderID = event.senderID;
        const body = event.body ? event.body.trim().toLowerCase() : '';
        const session = global.mangaStormSessions ? global.mangaStormSessions.get(threadID) : null;
        if (!session || senderID === api.getCurrentUserID()) return;

        if (session.step === 'chooseMode') {
            if (senderID !== session.expectedUser) return;
            if (body === 'multi') {
                session.mode = 'multi';
                session.step = 'waitStart';
                session.expectedUser = session.player1; // celui qui a lancé
                const msg = await api.sendMessage("Mode multijoueur activé.\nLe joueur 1 doit taper 'Start' pour lancer la partie.", threadID);
                session.lastMessageID = msg.messageID;
            } else if (body === 'bot') {
                session.mode = 'bot';
                session.player1 = session.expectedUser; // le joueur 1 est celui qui a lancé
                session.player2 = 'bot';
                session.step = 'waitStart';
                const msg = await api.sendMessage("Mode contre le bot activé.\nTapez 'Start' pour commencer.", threadID);
                session.lastMessageID = msg.messageID;
            } else {
                const msg = await api.sendMessage("❌ Choix invalide. Tapez 'multi' ou 'bot'.", threadID);
                session.lastMessageID = msg.messageID;
            }
            return;
        }

        if (session.step === 'waitStart') {
            if (senderID !== session.expectedUser) return;
            if (body === 'start') {
                if (session.mode === 'multi') {
                    session.step = 'waitPlayerIDs';
                    const msg = await api.sendMessage("Les joueurs, identifiez-vous :\nLe joueur 1 (celui qui a lancé) tapez '1', le joueur 2 tapez '2'.", threadID);
                    session.lastMessageID = msg.messageID;
                    session.expectedUser = null; // n'importe qui peut répondre
                } else { // mode bot
                    session.step = 'chooseChar1';
                    session.expectedUser = session.player1;
                    const charListMsg = await getCharacterListMessage();
                    const msg = await api.sendMessage(`Joueur 1, choisissez votre personnage en tapant le numéro :\n\n${charListMsg}`, threadID);
                    session.lastMessageID = msg.messageID;
                }
            }
            return;
        }

        if (session.step === 'waitPlayerIDs') {
            if (body === '1' && !session.player1) {
                // Vérifier que le joueur 1 n'est pas déjà pris et que l'ID n'est pas déjà utilisé par le joueur 2
                if (session.player2 === senderID) {
                    const msg = await api.sendMessage("Vous êtes déjà le joueur 2. Attendez que le joueur 1 s'identifie.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                session.player1 = senderID;
                const msg = await api.sendMessage(`✅ ${event.senderName || 'Utilisateur'} est maintenant Joueur 1.`, threadID);
                session.lastMessageID = msg.messageID;
            } else if (body === '2' && !session.player2) {
                if (session.player1 === senderID) {
                    const msg = await api.sendMessage("Vous êtes déjà le joueur 1. Attendez que le joueur 2 s'identifie.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                session.player2 = senderID;
                const msg = await api.sendMessage(`✅ ${event.senderName || 'Utilisateur'} est maintenant Joueur 2.`, threadID);
                session.lastMessageID = msg.messageID;
            } else {
                return; // message ignoré
            }

            // Vérifier si les deux joueurs sont prêts
            if (session.player1 && session.player2) {
                session.step = 'chooseChar1';
                session.expectedUser = session.player1;
                const charListMsg = await getCharacterListMessage();
                const msg = await api.sendMessage(`Les deux joueurs sont prêts !\n\nJoueur 1, choisissez votre personnage en tapant le numéro :\n\n${charListMsg}`, threadID);
                session.lastMessageID = msg.messageID;
            }
            return;
        }

        if (session.step === 'chooseChar1') {
            if (senderID !== session.expectedUser) return;
            const choice = parseInt(body);
            const character = getCharacterByNumber(choice);
            if (!character) {
                const msg = await api.sendMessage("Numéro invalide. Choisissez un personnage de la liste.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            session.player1Char = character;
            // Afficher la fiche du personnage
            const ficheMsg = getCharacterCard(character, 1);
            await api.sendMessage(ficheMsg, threadID);
            if (session.mode === 'bot') {
                // Le bot choisit aléatoirement
                const botChar = getRandomCharacter();
                session.player2Char = botChar;
                const ficheBot = getCharacterCard(botChar, 2);
                await api.sendMessage(ficheBot, threadID);
                await startBattle(api, session, threadID);
            } else {
                session.step = 'chooseChar2';
                session.expectedUser = session.player2;
                const charListMsg = await getCharacterListMessage();
                const msg = await api.sendMessage(`Joueur 2, choisissez votre personnage en tapant le numéro :\n\n${charListMsg}`, threadID);
                session.lastMessageID = msg.messageID;
            }
            return;
        }

        if (session.step === 'chooseChar2') {
            if (senderID !== session.expectedUser) return;
            const choice = parseInt(body);
            const character = getCharacterByNumber(choice);
            if (!character) {
                const msg = await api.sendMessage("Numéro invalide. Choisissez un personnage de la liste.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            // Vérifier que le personnage n'est pas déjà pris par le joueur 1
            if (character.name === session.player1Char.name) {
                const msg = await api.sendMessage("Ce personnage est déjà choisi par le Joueur 1. Veuillez en choisir un autre.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            session.player2Char = character;
            const ficheMsg = getCharacterCard(character, 2);
            await api.sendMessage(ficheMsg, threadID);
            await startBattle(api, session, threadID);
            return;
        }

        if (session.step === 'battle') {
            // Gérer les actions de combat
            if (session.currentTurn === 1 && senderID !== session.player1) return;
            if (session.currentTurn === 2 && session.player2 !== 'bot' && senderID !== session.player2) return;

            // Si c'est le tour du bot
            if (session.currentTurn === 2 && session.player2 === 'bot') {
                const botAttacks = session.player2Char.attacks;
                // Choisir une attaque que le bot peut se permettre en PE
                const validAttacks = botAttacks.filter(a => a.cost <= session.player2PE);
                const attack = validAttacks.length > 0 ? validAttacks[Math.floor(Math.random() * validAttacks.length)] : botAttacks[0]; // attaque de base si pas assez de PE
                await processAttack(api, session, threadID, attack, 2);
            } else {
                // Joueur humain
                const choice = parseInt(body);
                const attacks = session.currentTurn === 1 ? session.player1Char.attacks : session.player2Char.attacks;
                if (isNaN(choice) || choice < 1 || choice > attacks.length) {
                    const msg = await api.sendMessage("Numéro d'attaque invalide. Choisissez parmi la liste.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                const attack = attacks[choice - 1];
                const pe = session.currentTurn === 1 ? session.player1PE : session.player2PE;
                if (attack.cost > pe) {
                    const msg = await api.sendMessage("Pas assez d'énergie pour cette attaque. Choisissez-en une autre.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                await processAttack(api, session, threadID, attack, session.currentTurn);
            }
        }
    }
};

// Fonctions utilitaires pour le jeu

function getCharacterByNumber(num) {
    const chars = getCharacters();
    if (num >= 1 && num <= chars.length) {
        return chars[num - 1];
    }
    return null;
}

function getRandomCharacter() {
    const chars = getCharacters();
    return chars[Math.floor(Math.random() * chars.length)];
}

async function getCharacterListMessage() {
    const chars = getCharacters();
    let msg = '';
    chars.forEach((c, index) => {
        msg += `${index + 1}. ${c.name}\n`;
    });
    return msg;
}

function getCharacterCard(character, playerNum) {
    let card = `࿇ ═✥𝐌𝐀𝐍𝐆𝐀-𝐒𝐓𝐎𝐑𝐌✥═ ࿇\n`;
    card += `👤 Joueur ${playerNum} : ${character.name}\n`;
    card += `❤️ PV : ${character.maxPV} | ⚛️ PE : ${character.maxPE}\n`;
    card += `⚡ Point fort : ${character.strength}\n`;
    card += `💢 Point faible : ${character.weakness}\n`;
    card += `🗡️ Attaques :\n`;
    character.attacks.forEach((att, i) => {
        card += `  ${i + 1}. ${att.name} (Dégâts: ${att.damage}, Coût PE: ${att.cost})\n`;
    });
    card += `࿇ ══━━━━✥◈✥━━━━══ ࿇`;
    return card;
}

function getBar(value, max, length = 10) {
    const filled = Math.round((value / max) * length);
    let bar = '';
    for (let i = 0; i < length; i++) {
        bar += i < filled ? '▓' : '░';
    }
    return bar;
}

function getPEBar(value, max, length = 10) {
    const filled = Math.round((value / max) * length);
    let bar = '';
    for (let i = 0; i < length; i++) {
        bar += i < filled ? '▒' : '░';
    }
    return bar;
}

function getBattleStatus(session) {
    const p1 = session.player1Char;
    const p2 = session.player2Char;
    let msg = `࿇ ═✥𝐌𝐀𝐍𝐆𝐀-𝐒𝐓𝐎𝐑𝐌✥═ ࿇\n`;
    msg += `👤 Joueur 1 : ${p1.name}\n`;
    msg += `❤️ PV : [${getBar(session.player1PV, p1.maxPV)}] ${Math.round((session.player1PV / p1.maxPV) * 100)}%\n`;
    msg += `⚛️ PE : [${getPEBar(session.player1PE, p1.maxPE)}] ${Math.round((session.player1PE / p1.maxPE) * 100)}%\n`;
    msg += `\n`;
    msg += `👤 Joueur 2 : ${p2.name}\n`;
    msg += `❤️ PV : [${getBar(session.player2PV, p2.maxPV)}] ${Math.round((session.player2PV / p2.maxPV) * 100)}%\n`;
    msg += `⚛️ PE : [${getPEBar(session.player2PE, p2.maxPE)}] ${Math.round((session.player2PE / p2.maxPE) * 100)}%\n`;
    msg += `࿇ ══━━━━✥◈✥━━━━══ ࿇\n`;
    msg += `Au tour du Joueur ${session.currentTurn}`;
    return msg;
}

async function startBattle(api, session, threadID) {
    // Initialiser PV et PE
    session.player1PV = session.player1Char.maxPV;
    session.player1PE = session.player1Char.maxPE;
    session.player2PV = session.player2Char.maxPV;
    session.player2PE = session.player2Char.maxPE;
    session.currentTurn = 1;
    session.step = 'battle';
    session.expectedUser = session.player1; // tour du joueur 1

    const statusMsg = getBattleStatus(session);
    const attacksMsg = await getAttacksMessage(session.player1Char, 1);
    const msg = await api.sendMessage(`${statusMsg}\n\n${attacksMsg}`, threadID);
    session.lastMessageID = msg.messageID;
}

async function getAttacksMessage(character, playerNum) {
    let msg = `🗡️ Joueur ${playerNum}, choisissez une attaque :\n`;
    character.attacks.forEach((att, i) => {
        msg += `${i + 1}. ${att.name} (Dégâts: ${att.damage}, Coût: ${att.cost} PE)\n`;
    });
    return msg;
}

async function processAttack(api, session, threadID, attack, attacker) {
    const target = attacker === 1 ? 2 : 1;
    const attackerChar = attacker === 1 ? session.player1Char : session.player2Char;
    const targetChar = target === 1 ? session.player1Char : session.player2Char;
    
    // Calculer les dégâts (on peut ajouter des modificateurs de forces/faiblesses)
    let damage = attack.damage;
    // Si l'attaquant a un bonus contre le type de la cible (simplifié)
    if (attackerChar.strongAgainst && attackerChar.strongAgainst === targetChar.type) {
        damage = Math.floor(damage * 1.3);
    }
    if (attackerChar.weakAgainst && attackerChar.weakAgainst === targetChar.type) {
        damage = Math.floor(damage * 0.7);
    }

    // Appliquer les dégâts
    if (target === 1) {
        session.player1PV = Math.max(0, session.player1PV - damage);
    } else {
        session.player2PV = Math.max(0, session.player2PV - damage);
    }

    // Consommer l'énergie
    if (attacker === 1) {
        session.player1PE -= attack.cost;
    } else {
        session.player2PE -= attack.cost;
    }

    // Message d'attaque
    const attackerName = attacker === 1 ? (await getUserName(api, session.player1)) : (session.player2 === 'bot' ? 'Bot' : (await getUserName(api, session.player2)));
    const targetName = target === 1 ? (session.player1 === 'bot' ? 'Bot' : (await getUserName(api, session.player1))) : (session.player2 === 'bot' ? 'Bot' : (await getUserName(api, session.player2)));
    const attackMsg = `⚔️ ${attackerName} utilise ${attack.name} sur ${targetName} et inflige ${damage} dégâts !`;

    // Vérifier si le joueur cible est KO
    if ((target === 1 && session.player1PV <= 0) || (target === 2 && session.player2PV <= 0)) {
        const winner = attacker;
        const winnerName = attacker === 1 ? (await getUserName(api, session.player1)) : (session.player2 === 'bot' ? 'Bot' : (await getUserName(api, session.player2)));
        const statusMsg = getBattleStatus(session);
        await api.sendMessage(`${attackMsg}\n\n${statusMsg}\n\n🏆 ${winnerName} remporte le combat !`, threadID);
        // Nettoyer la session
        global.mangaStormSessions.delete(threadID);
        return;
    }

    // Changer de tour
    session.currentTurn = target;
    session.expectedUser = target === 1 ? session.player1 : (session.player2 === 'bot' ? null : session.player2);

    const statusMsg = getBattleStatus(session);
    let nextMsg = `${attackMsg}\n\n${statusMsg}`;
    if (session.currentTurn === 2 && session.player2 === 'bot') {
        nextMsg += '\n🤖 Le bot réfléchit...';
        const msg = await api.sendMessage(nextMsg, threadID);
        session.lastMessageID = msg.messageID;
        // Attendre un peu puis le bot attaque automatiquement
        setTimeout(async () => {
            if (global.mangaStormSessions.has(threadID)) {
                const s = global.mangaStormSessions.get(threadID);
                if (s.step === 'battle' && s.currentTurn === 2 && s.player2 === 'bot') {
                    const botAttacks = s.player2Char.attacks;
                    const validAttacks = botAttacks.filter(a => a.cost <= s.player2PE);
                    const att = validAttacks.length > 0 ? validAttacks[Math.floor(Math.random() * validAttacks.length)] : botAttacks[0];
                    // Simuler l'appel à processAttack comme si le bot avait tapé une commande
                    // On appelle directement la fonction de traitement
                    try {
                        await processAttack(api, s, threadID, att, 2);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }, 2000);
    } else {
        const attacksMsg = await getAttacksMessage(session.currentTurn === 1 ? session.player1Char : session.player2Char, session.currentTurn);
        nextMsg += `\n\n${attacksMsg}`;
        const msg = await api.sendMessage(nextMsg, threadID);
        session.lastMessageID = msg.messageID;
    }
}

async function getUserName(api, userID) {
    try {
        const info = await api.getUserInfo(userID);
        return info[userID].name;
    } catch (e) {
        return 'Utilisateur';
    }
}

function getCharacters() {
    return [
        {
            name: "Gojo",
            type: "Sorcier",
            maxPV: 120,
            maxPE: 150,
            strength: "Attaques dévastatrices, bouclier quasi infini",
            weakness: "Très gourmand en énergie",
            strongAgainst: "Ninja",
            weakAgainst: "Kaiju",
            attacks: [
                { name: "Infinity Void", damage: 35, cost: 30 },
                { name: "Red", damage: 25, cost: 20 },
                { name: "Blue", damage: 20, cost: 15 }
            ]
        },
        {
            name: "Yuji",
            type: "Sorcier physique",
            maxPV: 150,
            maxPE: 100,
            strength: "Résistance exceptionnelle, coups critiques",
            weakness: "Portée limitée",
            strongAgainst: "Kaiju",
            weakAgainst: "Otsutsuki",
            attacks: [
                { name: "Black Flash", damage: 40, cost: 25 },
                { name: "Divergent Fist", damage: 20, cost: 15 },
                { name: "Manji Kick", damage: 15, cost: 10 }
            ]
        },
        {
            name: "Sukuna",
            type: "Roi des fléaux",
            maxPV: 140,
            maxPE: 130,
            strength: "Dégâts massifs, régénération de PV",
            weakness: "Lent, facile à contrer",
            strongAgainst: "Sorcier",
            weakAgainst: "Ninja",
            attacks: [
                { name: "Cleave", damage: 30, cost: 20 },
                { name: "Dismantle", damage: 25, cost: 15 },
                { name: "Malevolent Shrine", damage: 50, cost: 40 }
            ]
        },
        {
            name: "Narumi",
            type: "Soldat",
            maxPV: 110,
            maxPE: 140,
            strength: "Rapidité et attaques combo",
            weakness: "Défense fragile",
            strongAgainst: "Ninja",
            weakAgainst: "Sorcier",
            attacks: [
                { name: "Sonic Blade", damage: 25, cost: 15 },
                { name: "Cyclone Slash", damage: 30, cost: 25 },
                { name: "Thunder Step", damage: 35, cost: 30 }
            ]
        },
        {
            name: "Naruto",
            type: "Ninja",
            maxPV: 130,
            maxPE: 130,
            strength: "Polyvalent, clones pour esquiver",
            weakness: "Dépendance à l'énergie naturelle",
            strongAgainst: "Otsutsuki",
            weakAgainst: "Kaiju",
            attacks: [
                { name: "Rasengan", damage: 30, cost: 20 },
                { name: "Shadow Clone Jutsu", damage: 20, cost: 15 },
                { name: "Tailed Beast Bomb", damage: 45, cost: 35 }
            ]
        },
        {
            name: "Boruto",
            type: "Ninja",
            maxPV: 115,
            maxPE: 140,
            strength: "Techniques variées, QI élevé",
            weakness: "Manque de puissance brute",
            strongAgainst: "Sorcier",
            weakAgainst: "Roi des fléaux",
            attacks: [
                { name: "Vanishing Rasengan", damage: 25, cost: 18 },
                { name: "Thunderclap Arrow", damage: 20, cost: 12 },
                { name: "Karma Seal", damage: 35, cost: 30 }
            ]
        },
        {
            name: "Ishiki",
            type: "Otsutsuki",
            maxPV: 150,
            maxPE: 150,
            strength: "Puissance écrasante, peut invoquer des cubes",
            weakness: "Arrogant, coûts PE élevés",
            strongAgainst: "Kaiju",
            weakAgainst: "Sorcier",
            attacks: [
                { name: "Sukunahikona", damage: 40, cost: 35 },
                { name: "Daikokuten", damage: 35, cost: 25 },
                { name: "Cube Crush", damage: 50, cost: 40 }
            ]
        },
        {
            name: "N°8",
            type: "Kaiju",
            maxPV: 160,
            maxPE: 110,
            strength: "Transformation monstrueuse, régénération rapide",
            weakness: "Instable, peut perdre le contrôle",
            strongAgainst: "Roi des fléaux",
            weakAgainst: "Soldat",
            attacks: [
                { name: "Kaiju Punch", damage: 30, cost: 15 },
                { name: "Tail Sweep", damage: 25, cost: 10 },
                { name: "Atomic Breath", damage: 45, cost: 35 }
            ]
        }
    ];
    }
