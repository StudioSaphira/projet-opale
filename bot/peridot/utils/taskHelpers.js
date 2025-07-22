// bot/peridot/utils/taskHelpers.js

const { EmbedBuilder } = require('discord.js');
const db = require('../../../shared/utils/db');

/**
 * Récupère le salon configuré pour les annonces automatisées dans un serveur.
 * @param {string} guildId
 * @param {Client} client
 * @returns {TextChannel | null}
 */
function getCommunicationChannel(guildId, client) {
  const row = db.prepare(`
    SELECT channel_id FROM channel_communication
    WHERE guild_id = ?
  `).get(guildId);

  if (!row?.channel_id) return null;

  return client.channels.cache.get(row.channel_id) || null;
}

/**
 * Vérifie si une annonce a déjà été envoyée.
 * @param {number} profileId
 * @param {string} platform - 'youtube', 'twitch', etc.
 * @param {string} postId
 * @returns {boolean}
 */
function isAlreadyAnnounced(profileId, platform, postId) {
  const result = db.prepare(`
    SELECT 1 FROM annonces_envoyées
    WHERE profile_id = ? AND platform = ? AND post_id = ?
  `).get(profileId, platform, postId);
  return !!result;
}

/**
 * Marque un post comme ayant été annoncé.
 * @param {number} profileId
 * @param {string} platform
 * @param {string} postId
 */
function markAsAnnounced(profileId, platform, postId) {
  db.prepare(`
    INSERT INTO annonces_envoyées (profile_id, platform, post_id)
    VALUES (?, ?, ?)
  `).run(profileId, platform, postId);
}

/**
 * Envoie un embed dans le bon salon si disponible.
 * @param {Object} options
 * @param {Client} options.client
 * @param {string} options.guildId
 * @param {EmbedBuilder} options.embed
 */
async function sendAnnouncement({ client, guildId, embed }) {
  const channel = getCommunicationChannel(guildId, client);
  if (!channel) {
    console.warn(`[❗] Aucun salon configuré pour les annonces dans le serveur ${guildId}`);
    return;
  }

  try {
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(`[❌] Erreur lors de l’envoi d’une annonce dans ${guildId} :`, err);
  }
}

module.exports = {
  getCommunicationChannel,
  isAlreadyAnnounced,
  markAsAnnounced,
  sendAnnouncement,
};