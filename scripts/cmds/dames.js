module.exports = {
    config: {
        name: "dames",
        version: "2.1.1",
        author: "Camille Uchiha",
        countDown: 2,
        role: 0,
        description: "Jeu de dames avec déplacements réels et système de forfait strict",
        category: "jeux",
        guide: "{p}dames bot : Jouer contre le Bot\n{p}dames move [de] [vers] : Bouger un pion\n{p}dames fin ou {p}dames stop : Déclarer forfait"
    },

    onStart: async function ({ api, event, args, message }) {
        const { threadID, senderID, mentions } = event;

        if (!global.damesGames) global.damesGames = new Map();

        // 1. GESTION STRICTE DU FORFAIT (SEULEMENT "FIN" OU "STOP")
        if (args[0] === "fin" || args[0] === "stop") {
            const game = global.damesGames.get(threadID);
            if (!game) return message.reply("Aucune partie n'est en cours dans ce groupe.");

            // Vérifier que c'est bien l'un des joueurs actifs qui tape la commande
            if (senderID !== game.player1 && senderID !== game.player2) {
                return message.reply("Seuls les participants de la partie peuvent déclarer forfait.");
            }

            // Récupération du nom Facebook de l'utilisateur
            const info = await api.getUserInfo(senderID);
            const name = info[senderID]?.name || "Le joueur";

            let txt = `🏳️ Coup de sifflet final ! @${name} a écrit ${args[0].toUpperCase()} et déclare forfait.\n\n`;

            if (game.isBot) {
                txt += `🤖 Victoire par abandon pour le Bot (${game.difficulty}) !`;
                global.damesGames.delete(threadID);
                return message.reply({
                    body: txt,
                    mentions: [{ tag: `@${name}`, id: senderID }]
                });
            } else {
                const winnerID = senderID === game.player1 ? game.player2 : game.player1;
                txt += `🏆 Victoire par abandon pour l'adversaire !`;
                
                global.damesGames.delete(threadID);
                return message.reply({
                    body: txt,
                    mentions: [
                        { tag: `@${name}`, id: senderID },
                        { tag: "@mention", id: winnerID }
                    ]
                });
            }
        }

        // Convertit les coordonnées texte (Ex: C6) en index de tableau [ligne][colonne]
        const parseCoords = (str) => {
            if (!str || str.length !== 2) return null;
            const col = str.toUpperCase().charCodeAt(0) - 65;
            const row = parseInt(str) - 1;
            if (row < 0 || row > 7 || col < 0 || col > 7) return null;
            return { row, col };
        };

        // Génère le rendu visuel du plateau
        const renderBoard = (board) => {
            const letters = "   A  B  C  D  E  F  G  H\n";
            let display = letters;
            for (let r = 0; r < 8; r++) {
                display += `${r + 1} `;
                for (let c = 0; c < 8; c++) {
                    display += board[r][c];
                }
                display += ` ${r + 1}\n`;
            }
            display += letters;
            return display;
        };

        // 2. ACTION DE DÉPLACEMENT RÉEL
        if (args[0] === "move") {
            const game = global.damesGames.get(threadID);
            if (!game) return message.reply("Aucune partie en cours. Lancez-en une avec {p}dames bot");
            if (senderID !== game.turn) return message.reply("Ce n'est pas votre tour !");

            const from = parseCoords(args[1]);
            const to = parseCoords(args[2]);

            if (!from || !to) return message.reply("Format invalide. Exemple correct : {p}dames move C6 B5");

            let board = game.board;
            let piece = board[from.row][from.col];

            if (piece !== "🔴") return message.reply("Il n'y a pas de pion rouge (le vôtre) sur cette case de départ.");
            if (board[to.row][to.col] !== "⬛") return message.reply("La case d'arrivée doit être une case noire vide (⬛).");

            board[from.row][from.col] = "⬛";
            board[to.row][to.col] = "🔴";
            game.board = board;

            if (game.isBot) {
                await message.reply(`🔴 Vous avez déplacé votre pion.\n\n${renderBoard(board)}\n🤖 Réflexion du Bot...`);
                await new Promise(resolve => setTimeout(resolve, 1500));

                let botMoved = false;
                for (let r = 0; r < 7 && !botMoved; r++) {
                    for (let c = 0; c < 8 && !botMoved; c++) {
                        if (board[r][c] === "🟤") {
                            if (c > 0 && board[r+1][c-1] === "⬛") {
                                board[r][c] = "⬛";
                                board[r+1][c-1] = "🟤";
                                botMoved = true;
                            } else if (c < 7 && board[r+1][c+1] === "⬛") {
                                board[r][c] = "⬛";
                                board[r+1][c+1] = "🟤";
                                botMoved = true;
                            }
                        }
                    }
                }

                game.board = board;
                return message.reply(`🟤 Le Bot a joué son coup (${game.difficulty}) :\n\n${renderBoard(board)}\nÀ votre tour !`);
            }

            game.turn = game.turn === game.player1 ? game.player2 : game.player1;
            return message.reply(`Coup validé !\n\n${renderBoard(board)}\nAu tour de l'adversaire.`);
        }

        // 3. INITIALISATION DU MODE BOT
        if (args[0] === "bot") {
            return message.reply(
                "🤖 Choisissez la difficulté en répondant avec le NUMÉRO :\n\n" +
                "1️⃣ - Facile\n" +
                "2️⃣ - Normal\n" +
                "3️⃣ - Difficile"
            , (err, info) => {
                if (global.GoatBot?.onReply) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        authorID: senderID,
                        type: "select_difficulty"
                    });
                }
            });
        }

        // 4. MODE DUO (MENTION)
        const mentionIDs = Object.keys(mentions);
        if (mentionIDs.length > 0) {
            const opponent = mentionIDs[0];
            if (opponent === senderID) return message.reply("Vous ne pouvez pas jouer contre vous-même.");

            let board = [];
            for (let r = 0; r < 8; r++) {
                board[r] = [];
                for (let c = 0; c < 8; c++) {
                    let isDark = (r + c) % 2 === 1;
                    if (isDark) {
                        if (r < 3) board[r][c] = "🟤";
                        else if (r > 4) board[r][c] = "🔴";
                        else board[r][c] = "⬛";
                    } else {
                        board[r][c] = "⬜";
                    }
                }
            }

            global.damesGames.set(threadID, {
                player1: senderID,
                player2: opponent,
                turn: senderID,
                isBot: false,
                board: board
            });

            return message.reply(`⚔️ Partie lancée contre votre ami !\n\n${renderBoard(board)}\n🔴 C'est à vous de commencer.`);
        }

        return message.reply("Pour jouer aux dames :\n• {p}dames bot (Contre l'IA)\n• {p}dames @mention (Contre un ami)");
    },

    onReply: async function ({ api, event, Reply, message }) {
        const { senderID, body, threadID } = event;
        if (senderID !== Reply.authorID) return;

        if (Reply.type === "select_difficulty") {
            let diff = "";
            if (body === "1") diff = "facile";
            else if (body === "2") diff = "normal";
            else if (body === "3") diff = "difficile";
            else return message.reply("Choix invalide. Répondez avec 1, 2 ou 3.");

            let board = [];
            for (let r = 0; r < 8; r++) {
                board[r] = [];
                for (let c = 0; c < 8; c++) {
                    let isDark = (r + c) % 2 === 1;
                    if (isDark) {
                        if (r < 3) board[r][c] = "🟤";
                        else if (r > 4) board[r][c] = "🔴";
                        else board[r][c] = "⬛";
                    } else {
                        board[r][c] = "⬜";
                    }
                }
            }

            global.damesGames.set(threadID, {
                player1: senderID,
                player2: "bot",
                turn: senderID,
                isBot: true,
                difficulty: diff,
                board: board
            });

            if (global.GoatBot?.onReply) global.GoatBot.onReply.delete(event.messageID);

            const letters = "   A  B  C  D  E  F  G  H\n";
            let boardDisplay = letters;
            for (let r = 0; r < 8; r++) {
                boardDisplay += `${r + 1} `;
                for (let c = 0; c < 8; c++) {
                    boardDisplay += board[r][c];
                }
                boardDisplay += ` ${r + 1}\n`;
            }
            boardDisplay += letters;

            return message.reply(`🎮 Mode **${diff.toUpperCase()}** configuré !\n\n${boardDisplay}\n🔴 Vos pions sont en bas. Jouez votre premier coup avec : \nExemple : \`!dames move C6 B5\``);
        }
    }
};


