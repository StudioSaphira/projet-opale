// bot/peridot/utils/fetchTikTok.js

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Récupère le dernier post visible d'un compte TikTok public.
 * @param {string} tiktokUrl - URL du profil TikTok (ex: https://www.tiktok.com/@pseudo)
 * @returns {Promise<{postId: string, postUrl: string, caption: string, timestamp: string}>}
 */
async function fetchTikTokPost(tiktokUrl) {
  if (!/^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/?$/.test(tiktokUrl)) {
    throw new Error('URL TikTok invalide.');
  }

  try {
    const res = await fetch(tiktokUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!res.ok) throw new Error('Impossible d’accéder au profil TikTok.');
    const html = await res.text();
    const $ = cheerio.load(html);

    // Recherche des scripts contenant les données intégrées
    const scripts = $('script[id="SIGI_STATE"]').html();
    if (!scripts) throw new Error('Script SIGI_STATE introuvable.');

    const json = JSON.parse(scripts);
    const userPosts = json.ItemList?.userPost?.list || [];

    if (userPosts.length === 0) throw new Error('Aucun post trouvé.');

    const latestPostId = userPosts[0];
    const video = json.ItemModule?.[latestPostId];
    if (!video) throw new Error('Détails du post introuvables.');

    const postUrl = `https://www.tiktok.com/@${video.author}/video/${video.id}`;
    const caption = video.desc || 'Nouvelle vidéo TikTok';
    const timestamp = new Date(video.createTime * 1000).toISOString();

    return {
      postId: video.id,
      postUrl,
      caption,
      timestamp
    };

  } catch (err) {
    console.error('[fetchTikTokPost] Erreur :', err.message);
    throw err;
  }
}

module.exports = fetchTikTokPost;