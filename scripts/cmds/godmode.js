const fs = require("fs-extra");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "cache", "godmode_config.json");

// Initialisation de la configuration de stockage
if (!fs.existsSync(CONFIG_PATH)) {
  fs.ensureDirSync(path.dirname(CONFIG_PATH));
  fs.writeJsonSync(CONFIG_PATH, { protectedThreads: [], dataStorage: {} });
}

function getStorage() {
  return fs.readJsonSync(CONFIG_PATH);
}

function saveStorage(data) {
  fs.writeJsonSync(CONFIG_PATH, data);
}

module.exports = {
  config: {
    name: "godmode",
    version: "1.0",
    author: "Camille",
    countDown: 5,
    role: 2, // Strictement réservé à l'Owner du bot
    dev: true,
    shortDescription: "Active l'immunité absolue du bot et de son Monarque dans ce Portail",
    longDescription: "Si quelqu'un retire le bot ou l'owner, le système le punit et le bannit instantanément.",
    category: "owner",
    guide: { fr: "{p}{n} [on|off]" },
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const storage = getStorage();

    if (!args[0]) {
      const isActivated = storage.protectedThreads.includes(threadID);
      return api.sendMessage(`🛡️ STATUS DU PORTAIL 🛡️\n\nL'immunité du Monarque est actuellement : ${isActivated ? "🔴 ACTIVÉE" : "⚪ DÉSACTIVÉE"}\n\n👉 Utilise \`godmode on\` pour l'activer ou \`godmode off\` pour la retirer.`, threadID, messageID);
    }

    const state = args[0].toLowerCase();

    if (state === "on") {
      if (storage.protectedThreads.includes(threadID)) {
        return api.sendMessage("⚠️ Ce Portail est déjà sous protection absolue des Ombres.", threadID, messageID);
      }
      storage.protectedThreads.push(threadID);
      saveStorage(storage);
      return api.sendMessage("👑 Protocole RANG S : IMMUNITÉ ACTIVÉE.\n\nLe Monarque et ses Ombres verrouillent ce Portail. Toute tentative d'expulsion sera sévèrement punie. ⚔️", threadID, messageID);
    } 
    
    if (state === "off") {
      if (!storage.protectedThreads.includes(threadID)) {
        return api.sendMessage("⚠️ Ce Portail ne possède aucune protection active.", threadID, messageID);
      }
      storage.protectedThreads = storage.protectedThreads.filter(id => id !== threadID);
      saveStorage(storage);
      return api.sendMessage("🔓 Les ombres se retirent... L'immunité de ce Portail a été désactivée.", threadID, messageID);
    }

    return api.sendMessage("❌ Commande invalide. Utilisez `on` ou `off`.", threadID, messageID);
  },

  // Ce bloc intercepte les actions en temps réel (quand un membre quitte ou se fait expulser)
  onEvent: async function ({ api, event, Threads }) {
    const { logMessageType, logMessageData, threadID, author } = event;
    
    // On écrit uniquement si l'événement concerne un membre retiré
    if (logMessageType !== "log:unsubscribe") return;

    const storage = getStorage();
    // Si le groupe actuel n'est pas protégé, on ignore
    if (!storage.protectedThreads.includes(threadID)) return;

    const botID = api.getCurrentUserID();
    const leftParticipantID = logMessageData.leftParticipantFbId;

    // Récupération des configurations globales de l'owner (détecté par son rôle 2 dans le bot)
    const threadInfo = await api.getThreadInfo(threadID);
    
    // Cas 1 : Quelqu'un a essayé d'expulser le BOT lui-même
    // Note : Souvent le bot ne peut pas réagir s'il est déjà dehors, mais s'il est réintégré via un compte lié,
    // ou si l'action échoue à moitié, ce déclencheur s'active.
    if (leftParticipantID === botID && author !== botID) {
      try {
        // Le bot tente de bannir l'auteur du crime avant de perdre ses accès ou s'il a encore un token actif
        await api.removeUserFromGroup(author, threadID);
        await api.sendMessage(`🚫 Tentative de bannissement du Bot détectée !\n\nL'entité responsable [${author}] a été éliminée par le Système.`, threadID);
      } catch (err) {
        console.error("Erreur d'immunité bot :", err);
      }
    }

    // Cas 2 : Quelqu'un a essayé d'expulser le MONARQUE (Toi, l'auteur de la commande / Owner)
    // Remplacer 'author' par la validation de ton propre ID ou rôle utilisateur
    const authorRole = global.GoatBot.config.adminBot.includes(leftParticipantID); // Vérifie si l'expulsé est l'admin
    
    if (authorRole && author !== leftParticipantID) {
      try {
        // 1. Envoyer un message de fureur
        await api.sendMessage(`🚨 ALERTE CRITIQUE 🚨\n\nUne tentative d'élimination du Monarque des Ombres a été détectée !\nRéaction immédiate du Système en cours...`, threadID);
        
        // 2. Expulser l'attaquant du groupe
        await api.removeUserFromGroup(author, threadID);
        
        // 3. Réinviter immédiatement le Monarque (l'owner) dans le groupe
        await api.addUserToGroup(leftParticipantID, threadID);
        
        // 4. Message de confirmation
        await api.sendMessage(`✅ Rétablissement accompli.\nL'intrus a été banni du Portail. Soumettez-vous ! 💙`, threadID);
      } catch (e) {
        console.error("Échec du protocole GodMode sur l'owner:", e);
        // Si le bot n'est pas admin du groupe, il prévient par message
        await api.sendMessage("⚠️ Échec du protocole : Donnez les droits Administrateur (Badge) au Bot pour appliquer la punition système !", threadID);
      }
    }
  }
};


