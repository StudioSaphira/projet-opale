// shared/middleware/cooldown.js

/**
 * Système de cooldown basique.
 * Chaque clé identifie un "canal" (par ex : socket.id, userID ou IP).
 * On retient la dernière exécution et on compare avec un délai minimal.
 */

const cooldowns = new Map();

/**
 * Vérifie si un utilisateur est en cooldown.
 * @param {string} key - Identifiant unique (socket.id, userID…).
 * @param {number} delayMs - Délai minimum en millisecondes.
 * @returns {boolean} true si encore en cooldown, false sinon.
 */
function isOnCooldown(key, delayMs) {
  const now = Date.now();

  if (cooldowns.has(key)) {
    const lastTime = cooldowns.get(key);
    if (now - lastTime < delayMs) {
      return true; // Encore en cooldown
    }
  }

  // Pas de cooldown actif ou délai expiré → mettre à jour
  cooldowns.set(key, now);
  return false;
}

module.exports = { isOnCooldown };
