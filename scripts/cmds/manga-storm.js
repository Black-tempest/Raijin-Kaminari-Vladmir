module.exports = {
    config: {
        name: "manga-storm",
        version: "2.0",
        author: "Veldora Tempest",
        countDown: 5,
        role: 0,
        shortDescription: "Jeu de combat Manga Storm",
        longDescription: "Affrontez un autre joueur ou le bot avec des personnages iconiques. Respecte les univers, les techniques et les passives (ex: Infinity de Gojo). Tapez 'fin' pour abandonner.",
        category: "jeux",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, message }) {
        const threadID = event.threadID;
        const senderID = event.senderID;

        if (global.mangaStormSessions && global.mangaStormSessions.has(threadID)) {
            return message.reply("Une partie est déjà en cours dans ce groupe.");
        }

        const session = {
            threadID,
            player1: null,
            player2: null,
            mode: null,
            step: 'chooseMode',
            expectedUser: senderID,
            player1Char: null,
            player2Char: null,
            player1PV: 0,
            player1PE: 0,
            player2PV: 0,
            player2PE: 0,
            currentTurn: 1,
            lastMessageID: null,
            _p1confirmed: false
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
                session.player1 = senderID;
                session.step = 'waitStart';
                session.expectedUser = session.player1;
                const msg = await api.sendMessage("Mode multijoueur activé.\nLe joueur 1 doit taper 'Start' pour lancer la partie.", threadID);
                session.lastMessageID = msg.messageID;
            } else if (body === 'bot') {
                session.mode = 'bot';
                session.player1 = senderID;
                session.player2 = 'bot';
                session.step = 'waitStart';
                session.expectedUser = session.player1;
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
                    session.expectedUser = null;
                    const msg = await api.sendMessage("Confirmez votre identité :\nLe joueur 1 tapez '1', le joueur 2 tapez '2'.", threadID);
                    session.lastMessageID = msg.messageID;
                } else {
                    session.step = 'chooseChar1';
                    session.expectedUser = session.player1;
                    const charListMsg = await getCharacterListMessage();
                    const msg = await api.sendMessage(`Joueur 1, choisissez votre personnage :\n\n${charListMsg}`, threadID);
                    session.lastMessageID = msg.messageID;
                }
            }
            return;
        }

        if (session.step === 'waitPlayerIDs') {
            if (body === '1') {
                if (senderID !== session.player1) {
                    const msg = await api.sendMessage("Vous n'êtes pas le joueur 1.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                if (!session._p1confirmed) {
                    session._p1confirmed = true;
                    const msg = await api.sendMessage("✅ Joueur 1 confirmé.", threadID);
                    session.lastMessageID = msg.messageID;
                }
            } else if (body === '2') {
                if (senderID === session.player1) {
                    const msg = await api.sendMessage("Vous êtes déjà le joueur 1.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                if (session.player2) {
                    const msg = await api.sendMessage("Le joueur 2 est déjà défini.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                session.player2 = senderID;
                const msg = await api.sendMessage(`✅ ${event.senderName || 'Utilisateur'} est maintenant Joueur 2.`, threadID);
                session.lastMessageID = msg.messageID;
            }
            if (session._p1confirmed && session.player2) {
                session.step = 'chooseChar1';
                session.expectedUser = session.player1;
                const charListMsg = await getCharacterListMessage();
                const msg = await api.sendMessage(`Joueur 1, choisissez votre personnage :\n\n${charListMsg}`, threadID);
                session.lastMessageID = msg.messageID;
            }
            return;
        }

        if (session.step === 'chooseChar1') {
            if (senderID !== session.expectedUser) return;
            const choice = parseInt(body);
            const character = getCharacterByNumber(choice);
            if (!character) {
                const msg = await api.sendMessage("Numéro invalide.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            session.player1Char = character;
            await api.sendMessage(getCharacterCard(character, 1), threadID);
            if (session.mode === 'bot') {
                const botChar = getRandomCharacter();
                session.player2Char = botChar;
                await api.sendMessage(getCharacterCard(botChar, 2), threadID);
                await startBattle(api, session, threadID);
            } else {
                session.step = 'chooseChar2';
                session.expectedUser = session.player2;
                const charListMsg = await getCharacterListMessage();
                const msg = await api.sendMessage(`Joueur 2, choisissez votre personnage :\n\n${charListMsg}`, threadID);
                session.lastMessageID = msg.messageID;
            }
            return;
        }

        if (session.step === 'chooseChar2') {
            if (senderID !== session.expectedUser) return;
            const choice = parseInt(body);
            const character = getCharacterByNumber(choice);
            if (!character) {
                const msg = await api.sendMessage("Numéro invalide.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            if (character.name === session.player1Char.name) {
                const msg = await api.sendMessage("Ce personnage est déjà choisi par le Joueur 1.", threadID);
                session.lastMessageID = msg.messageID;
                return;
            }
            session.player2Char = character;
            await api.sendMessage(getCharacterCard(character, 2), threadID);
            await startBattle(api, session, threadID);
            return;
        }

        if (session.step === 'battle') {
            if (body === 'fin') {
                const loser = senderID === session.player1 ? 1 : (session.player2 !== 'bot' && senderID === session.player2 ? 2 : null);
                if (!loser) return;
                const winner = loser === 1 ? session.player2 : session.player1;
                const winnerName = winner === 'bot' ? 'Bot' : await getUserName(api, winner);
                const loserName = loser === 1 ? await getUserName(api, session.player1) : (session.player2 === 'bot' ? 'Bot' : await getUserName(api, session.player2));
                await api.sendMessage(`${loserName} abandonne le combat !\n🏆 ${winnerName} remporte la victoire par forfait !`, threadID);
                global.mangaStormSessions.delete(threadID);
                return;
            }

            if (session.currentTurn === 1 && senderID !== session.player1) return;
            if (session.currentTurn === 2 && session.player2 !== 'bot' && senderID !== session.player2) return;

            if (session.currentTurn === 2 && session.player2 === 'bot') {
                const botAttacks = session.player2Char.attacks.filter(a => a.cost <= session.player2PE);
                const attack = botAttacks.length ? botAttacks[Math.floor(Math.random() * botAttacks.length)] : session.player2Char.attacks[0];
                await processAttack(api, session, threadID, attack, 2);
            } else {
                const choice = parseInt(body);
                const attacks = session.currentTurn === 1 ? session.player1Char.attacks : session.player2Char.attacks;
                if (isNaN(choice) || choice < 1 || choice > attacks.length) {
                    const msg = await api.sendMessage("Numéro d'attaque invalide.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                const attack = attacks[choice - 1];
                const pe = session.currentTurn === 1 ? session.player1PE : session.player2PE;
                if (attack.cost > pe) {
                    const msg = await api.sendMessage("Pas assez d'énergie.", threadID);
                    session.lastMessageID = msg.messageID;
                    return;
                }
                await processAttack(api, session, threadID, attack, session.currentTurn);
            }
        }
    }
};

// ─── HELPERS ────────────────────────────────────

function getCharacterByNumber(num) {
    const chars = getCharacters();
    return (num >= 1 && num <= chars.length) ? chars[num - 1] : null;
}

function getRandomCharacter() {
    const chars = getCharacters();
    return chars[Math.floor(Math.random() * chars.length)];
}

async function getCharacterListMessage() {
    return getCharacters().map((c, i) => `${i + 1}. ${c.name}`).join('\n');
}

function getCharacterCard(char, playerNum) {
    let c = `࿇ ═✥𝐌𝐀𝐍𝐆𝐀-𝐒𝐓𝐎𝐑𝐌✥═ ࿇\n`;
    c += `👤 Joueur ${playerNum} : ${char.name}\n`;
    c += `❤️ PV : ${char.maxPV} | ⚛️ PE : ${char.maxPE}\n`;
    c += `⚡ Point fort : ${char.strength}\n`;
    c += `💢 Point faible : ${char.weakness}\n`;
    c += `🗡️ Attaques :\n`;
    char.attacks.forEach((att, i) => c += `  ${i + 1}. ${att.name} (${att.damage} dgts, ${att.cost} PE)\n`);
    c += `࿇ ══━━━━✥◈✥━━━━══ ࿇`;
    return c;
}

function getBar(value, max, filledChar = '▓', emptyChar = '░', len = 10) {
    const filled = Math.round((value / max) * len);
    return Array(len).fill().map((_, i) => i < filled ? filledChar : emptyChar).join('');
}

function getBattleStatus(session) {
    const p1 = session.player1Char;
    const p2 = session.player2Char;
    const pv1 = Math.round((session.player1PV / p1.maxPV) * 100);
    const pe1 = Math.round((session.player1PE / p1.maxPE) * 100);
    const pv2 = Math.round((session.player2PV / p2.maxPV) * 100);
    const pe2 = Math.round((session.player2PE / p2.maxPE) * 100);
    return `࿇ ═✥𝐌𝐀𝐍𝐆𝐀-𝐒𝐓𝐎𝐑𝐌✥═ ࿇
👤 Joueur 1 : ${p1.name}
❤️ PV : [${getBar(session.player1PV, p1.maxPV, '▓', '░')}] ${pv1}%
⚛️ PE : [${getBar(session.player1PE, p1.maxPE, '▒', '░')}] ${pe1}%

👤 Joueur 2 : ${p2.name}
❤️ PV : [${getBar(session.player2PV, p2.maxPV, '▓', '░')}] ${pv2}%
⚛️ PE : [${getBar(session.player2PE, p2.maxPE, '▒', '░')}] ${pe2}%
࿇ ══━━━━✥◈✥━━━━══ ࿇`;
}

function buildAttackFrame(attackerName, attackName, targetName, damage) {
    const line = '▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭▭';
    return `                   ⚔️—⚔️
${line}
⚔️ ${attackerName} utilise ${attackName} sur ${targetName} et inflige ${damage} dégâts !
${line}`;
}

async function startBattle(api, session, threadID) {
    session.player1PV = session.player1Char.maxPV;
    session.player1PE = session.player1Char.maxPE;
    session.player2PV = session.player2Char.maxPV;
    session.player2PE = session.player2Char.maxPE;
    session.currentTurn = 1;
    session.step = 'battle';
    session.expectedUser = session.player1;
    const status = getBattleStatus(session);
    const attacks = await getAttacksMessage(session.player1Char, 1);
    const msg = await api.sendMessage(`${status}\n\n${attacks}`, threadID);
    session.lastMessageID = msg.messageID;
}

async function getAttacksMessage(char, playerNum) {
    let m = `Au tour du Joueur ${playerNum}\n\n🗡️ Joueur ${playerNum}, choisissez une attaque :\n`;
    char.attacks.forEach((att, i) => m += `${i + 1}. ${att.name} (${att.damage} dgts, ${att.cost} PE)\n`);
    m += `\n(Tapez 'fin' pour abandonner)`;
    return m;
}

async function processAttack(api, session, threadID, attack, attacker) {
    const target = attacker === 1 ? 2 : 1;
    const attackerChar = attacker === 1 ? session.player1Char : session.player2Char;
    const targetChar = target === 1 ? session.player1Char : session.player2Char;

    // Dégâts de base
    let damage = attack.damage;

    // Bonus/Malus de type
    if (attackerChar.strongAgainst && attackerChar.strongAgainst === targetChar.type) {
        damage = Math.floor(damage * 1.3);
    }
    if (attackerChar.weakAgainst && attackerChar.weakAgainst === targetChar.type) {
        damage = Math.floor(damage * 0.7);
    }

    // Passives de la cible (ex: Infinity de Gojo)
    if (targetChar.passive && targetChar.passive.name === "Infinity" && attack.type === "physique") {
        damage = Math.floor(damage * (1 - targetChar.passive.reduce));
    }

    // Appliquer les dégâts
    if (target === 1) {
        session.player1PV = Math.max(0, session.player1PV - damage);
    } else {
        session.player2PV = Math.max(0, session.player2PV - damage);
    }

    // Consommation PE
    if (attacker === 1) {
        session.player1PE -= attack.cost;
    } else {
        session.player2PE -= attack.cost;
    }

    const attackerName = attacker === 1 ? await getUserName(api, session.player1) : (session.player2 === 'bot' ? 'Bot' : await getUserName(api, session.player2));
    const targetName = target === 1 ? (session.player1 === 'bot' ? 'Bot' : await getUserName(api, session.player1)) : (session.player2 === 'bot' ? 'Bot' : await getUserName(api, session.player2));

    const status = getBattleStatus(session);
    const attackFrame = buildAttackFrame(attackerName, attack.name, targetName, damage);

    // Vérifier KO
    if ((target === 1 && session.player1PV <= 0) || (target === 2 && session.player2PV <= 0)) {
        const winner = attacker;
        const winnerName = attacker === 1 ? attackerName : (session.player2 === 'bot' ? 'Bot' : attackerName);
        await api.sendMessage(`${status}\n\n${attackFrame}\n\n🏆 ${winnerName} remporte le combat !`, threadID);
        global.mangaStormSessions.delete(threadID);
        return;
    }

    // Changer de tour
    session.currentTurn = target;
    session.expectedUser = target === 1 ? session.player1 : (session.player2 === 'bot' ? null : session.player2);

    let nextMsg = `${status}\n\n${attackFrame}\n\n`;
    if (session.currentTurn === 2 && session.player2 === 'bot') {
        nextMsg += '🤖 Le bot réfléchit...';
        const msg = await api.sendMessage(nextMsg, threadID);
        session.lastMessageID = msg.messageID;
        setTimeout(async () => {
            if (global.mangaStormSessions.has(threadID)) {
                const s = global.mangaStormSessions.get(threadID);
                if (s.step === 'battle' && s.currentTurn === 2 && s.player2 === 'bot') {
                    const botAttacks = s.player2Char.attacks.filter(a => a.cost <= s.player2PE);
                    const att = botAttacks.length ? botAttacks[Math.floor(Math.random() * botAttacks.length)] : s.player2Char.attacks[0];
                    try { await processAttack(api, s, threadID, att, 2); } catch (e) { console.error(e); }
                }
            }
        }, 2000);
    } else {
        const attacksMsg = await getAttacksMessage(session.currentTurn === 1 ? session.player1Char : session.player2Char, session.currentTurn);
        nextMsg += attacksMsg;
        const msg = await api.sendMessage(nextMsg, threadID);
        session.lastMessageID = msg.messageID;
    }
}

async function getUserName(api, uid) {
    try {
        const info = await api.getUserInfo(uid);
        return info[uid].name;
    } catch (e) {
        return 'Joueur';
    }
}

// ─── PERSONNAGES ────────────────────────────────

function getCharacters() {
    return [
        // ---------- originaux ----------
        { name: "Gojo", type: "Sorcier", maxPV: 130, maxPE: 150, strength: "Infinity : annule 80% des dégâts physiques. Attaques énergie dévastatrices.", weakness: "Attaques d'énergie et de type domaine.", strongAgainst: "Ninja", weakAgainst: "Kaiju", passive: { name: "Infinity", reduce: 0.8 },
            attacks: [{ name: "Infinity Void", damage: 40, cost: 30, type: "énergie" }, { name: "Red", damage: 30, cost: 20, type: "énergie" }, { name: "Blue", damage: 25, cost: 15, type: "énergie" }]
        },
        { name: "Yuji", type: "Sorcier physique", maxPV: 160, maxPE: 100, strength: "Résistance et coups critiques.", weakness: "Portée limitée.", strongAgainst: "Kaiju", weakAgainst: "Otsutsuki",
            attacks: [{ name: "Black Flash", damage: 45, cost: 25, type: "physique" }, { name: "Divergent Fist", damage: 25, cost: 15, type: "physique" }, { name: "Manji Kick", damage: 20, cost: 10, type: "physique" }]
        },
        { name: "Sukuna", type: "Roi des fléaux", maxPV: 150, maxPE: 140, strength: "Dégâts massifs, régénération.", weakness: "Vulnérabilité aux attaques conjointes.", strongAgainst: "Sorcier", weakAgainst: "Ninja",
            attacks: [{ name: "Cleave", damage: 35, cost: 20, type: "physique" }, { name: "Dismantle", damage: 30, cost: 15, type: "physique" }, { name: "Malevolent Shrine", damage: 55, cost: 40, type: "énergie" }]
        },
        { name: "Narumi", type: "Soldat", maxPV: 120, maxPE: 140, strength: "Rapidité et combos.", weakness: "Défense fragile.", strongAgainst: "Ninja", weakAgainst: "Sorcier",
            attacks: [{ name: "Sonic Blade", damage: 28, cost: 15, type: "physique" }, { name: "Cyclone Slash", damage: 35, cost: 25, type: "physique" }, { name: "Thunder Step", damage: 38, cost: 30, type: "physique" }]
        },
        { name: "Naruto", type: "Ninja", maxPV: 140, maxPE: 140, strength: "Polyvalent, clones.", weakness: "Dépendance à l'énergie naturelle.", strongAgainst: "Otsutsuki", weakAgainst: "Kaiju",
            attacks: [{ name: "Rasengan", damage: 33, cost: 20, type: "énergie" }, { name: "Shadow Clone Jutsu", damage: 22, cost: 15, type: "physique" }, { name: "Tailed Beast Bomb", damage: 48, cost: 35, type: "énergie" }]
        },
        { name: "Boruto", type: "Ninja", maxPV: 120, maxPE: 145, strength: "Techniques variées.", weakness: "Manque de puissance brute.", strongAgainst: "Sorcier", weakAgainst: "Roi des fléaux",
            attacks: [{ name: "Vanishing Rasengan", damage: 28, cost: 18, type: "énergie" }, { name: "Thunderclap Arrow", damage: 23, cost: 12, type: "physique" }, { name: "Karma Seal", damage: 40, cost: 30, type: "énergie" }]
        },
        { name: "Ishiki", type: "Otsutsuki", maxPV: 155, maxPE: 150, strength: "Puissance écrasante, cubes.", weakness: "Arrogance, coûts PE élevés.", strongAgainst: "Kaiju", weakAgainst: "Sorcier",
            attacks: [{ name: "Sukunahikona", damage: 42, cost: 35, type: "énergie" }, { name: "Daikokuten", damage: 38, cost: 25, type: "physique" }, { name: "Cube Crush", damage: 52, cost: 40, type: "énergie" }]
        },
        { name: "N°8", type: "Kaiju", maxPV: 170, maxPE: 110, strength: "Transformation monstrueuse, régénération.", weakness: "Instable.", strongAgainst: "Roi des fléaux", weakAgainst: "Soldat",
            attacks: [{ name: "Kaiju Punch", damage: 32, cost: 15, type: "physique" }, { name: "Tail Sweep", damage: 28, cost: 10, type: "physique" }, { name: "Atomic Breath", damage: 48, cost: 35, type: "énergie" }]
        },
        // ---------- nouveaux ----------
        { name: "Luffy", type: "Pirate", maxPV: 165, maxPE: 120, strength: "Élasticité, immunité aux impacts physiques contondants.", weakness: "Attaques tranchantes et énergie.", strongAgainst: "Kaiju", weakAgainst: "Soldat",
            attacks: [{ name: "Gomu Gomu no Pistol", damage: 30, cost: 15, type: "physique" }, { name: "Gomu Gomu no Elephant Gun", damage: 38, cost: 22, type: "physique" }, { name: "Gear 5 : Dawn Gatling", damage: 50, cost: 35, type: "physique" }]
        },
        { name: "Zoro", type: "Pirate épéiste", maxPV: 150, maxPE: 130, strength: "Coups tranchants, style à trois sabres.", weakness: "Attaques sournoises, dos.", strongAgainst: "Kaiju", weakAgainst: "Sorcier",
            attacks: [{ name: "Oni Giri", damage: 32, cost: 18, type: "physique" }, { name: "Purgatory Onigiri", damage: 40, cost: 28, type: "physique" }, { name: "Asura : Silver Mist", damage: 55, cost: 38, type: "physique" }]
        },
        { name: "Trafalgar Law", type: "Pirate chirurgien", maxPV: 130, maxPE: 145, strength: "Room : contrôle de l'espace, soin.", weakness: "Fragile sans son Room.", strongAgainst: "Sorcier", weakAgainst: "Roi des fléaux",
            attacks: [{ name: "Room : Shambles", damage: 28, cost: 22, type: "énergie" }, { name: "Gamma Knife", damage: 36, cost: 28, type: "énergie" }, { name: "Counter Shock", damage: 30, cost: 20, type: "énergie" }]
        },
        { name: "Megumi", type: "Sorcier invocateur", maxPV: 125, maxPE: 155, strength: "Shikigami variés, domaine en développement.", weakness: "Manque de puissance en combat direct.", strongAgainst: "Roi des fléaux", weakAgainst: "Ninja",
            attacks: [{ name: "Divine Dog : Totality", damage: 30, cost: 20, type: "physique" }, { name: "Nue", damage: 25, cost: 18, type: "énergie" }, { name: "Chimera Shadow Garden", damage: 45, cost: 35, type: "énergie" }]
        },
        { name: "Nobara", type: "Sorcier vaudou", maxPV: 120, maxPE: 140, strength: "Attaques à distance, résonance.", weakness: "Corps à corps faible.", strongAgainst: "Otsutsuki", weakAgainst: "Sorcier",
            attacks: [{ name: "Hairpin", damage: 22, cost: 12, type: "physique" }, { name: "Resonance", damage: 35, cost: 25, type: "énergie" }, { name: "Black Flash (marteau)", damage: 40, cost: 30, type: "physique" }]
        },
        { name: "Maki", type: "Restriction Céleste", maxPV: 145, maxPE: 80, strength: "Pas d'énergie maudite, immunisée aux domaines, force brute.", weakness: "Pas de soin, sensible aux dégâts purs.", strongAgainst: "Sorcier", weakAgainst: "Pirate",
            attacks: [{ name: "Dragon Bone", damage: 34, cost: 15, type: "physique" }, { name: "Split Soul", damage: 42, cost: 25, type: "physique" }, { name: "Heavenly Restraint", damage: 50, cost: 30, type: "physique" }]
        },
        { name: "Sung Jin Woo", type: "Chasseur d'élite", maxPV: 140, maxPE: 150, strength: "Invocation de l'armée des ombres, soin.", weakness: "Temps d'invocation.", strongAgainst: "Kaiju", weakAgainst: "Otsutsuki",
            attacks: [{ name: "Shadow Extraction", damage: 30, cost: 22, type: "énergie" }, { name: "Ruler's Authority", damage: 38, cost: 28, type: "énergie" }, { name: "Beru's Wrath", damage: 50, cost: 35, type: "physique" }]
        },
        { name: "Madara", type: "Ninja légendaire", maxPV: 160, maxPE: 155, strength: "Susanoo, météores.", weakness: "Arrogance, utilisation excessive de chakra.", strongAgainst: "Soldat", weakAgainst: "Pirate",
            attacks: [{ name: "Fire Style : Great Fire Annihilation", damage: 38, cost: 28, type: "énergie" }, { name: "Susanoo : Yasaka Magatama", damage: 45, cost: 35, type: "énergie" }, { name: "Tengai Shinsei (météore)", damage: 60, cost: 50, type: "énergie" }]
        },
        { name: "Sasuke", type: "Ninja renegade", maxPV: 135, maxPE: 150, strength: "Sharingan, Chidori.", weakness: "Dépendance au chakra maudit.", strongAgainst: "Sorcier", weakAgainst: "Roi des fléaux",
            attacks: [{ name: "Chidori", damage: 33, cost: 22, type: "énergie" }, { name: "Amaterasu", damage: 40, cost: 30, type: "énergie" }, { name: "Susanoo Arrow", damage: 48, cost: 38, type: "énergie" }]
        },
        { name: "Toji", type: "Restriction Céleste", maxPV: 155, maxPE: 70, strength: "Pas d'énergie maudite, sens surhumains, arsenal.", weakness: "Pas de régénération.", strongAgainst: "Sorcier", weakAgainst: "Kaiju",
            attacks: [{ name: "Inverted Spear of Heaven", damage: 35, cost: 18, type: "physique" }, { name: "Chain of a Thousand Miles", damage: 30, cost: 12, type: "physique" }, { name: "Soul Liberation Blade", damage: 45, cost: 25, type: "physique" }]
        }
    ];
        }
