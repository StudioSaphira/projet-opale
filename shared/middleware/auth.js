// shared/middleware/auth.js

require('dotenv').config();

/**
 * Middleware d'authentification pour socket.io
 * Vérifie que la clé API envoyée correspond à celle attendue.
 * 
 * @param {Object} data - Payload reçu du client.
 * @param {string} expectedKey - Clé API attendue (générée dynamiquement selon le bot).
 * @returns {boolean} true si autorisé, false sinon.
 */
function checkApiKey(data, expectedKey) {
  if (!data || !data.apiKey) {
    console.warn('[AUTH] ❌ Aucun apiKey fourni.');
    return false;
  }

  if (data.apiKey !== expectedKey) {
    console.warn('[AUTH] ❌ apiKey invalide :', data.apiKey);
    return false;
  }

  return true;
}

module.exports = { checkApiKey };
