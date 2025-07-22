// bot/peridot/utils/fetchTwitch.js

const fetch = require('node-fetch');

/**
 * Vérifie si un streamer Twitch est en live et retourne les données du stream.
 * @param {string} twitchUrl - ex: https://www.twitch.tv/nom_utilisateur
 * @returns {Promise<null|{
 *   postId: string,
 *   postUrl: string,
 *   caption: string,
 *   thumbnail: string,
 *   started_at: string,
 *   viewer_count: number,
 *   game_name: string
 * }>}
 */
async function fetchTwitchStream(twitchUrl) {
  const match = twitchUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
  if (!match) throw new Error('URL Twitch invalide.');

  const login = match[1];

  try {
    const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${login}`, {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': process.env.TWITCH_AUTH_TOKEN
      }
    });

    if (!response.ok) throw new Error('Échec de la requête Twitch API.');
    const data = await response.json();

    const stream = data.data[0];
    if (!stream) return null; // l'utilisateur n'est pas en live

    return {
      postId: stream.id,
      postUrl: `https://www.twitch.tv/${login}`,
      caption: stream.title || 'Live en cours',
      thumbnail: stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360'),
      started_at: stream.started_at,
      viewer_count: stream.viewer_count,
      game_name: stream.game_name || 'Jeu non précisé'
    };

  } catch (err) {
    console.error('[fetchTwitchStream] Erreur :', err.message);
    throw err;
  }
}

module.exports = fetchTwitchStream;