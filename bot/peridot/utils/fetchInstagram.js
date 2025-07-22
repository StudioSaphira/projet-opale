// bot/peridot/utils/fetchInstagram.js

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Tente de récupérer le dernier post d'un profil Instagram public.
 * @param {string} instagramUrl - Ex: https://www.instagram.com/nom_utilisateur/
 * @returns {Promise<{postId: string, postUrl: string, caption: string, timestamp: string}>}
 */
async function fetchInstagramPost(instagramUrl) {
  if (!instagramUrl.includes('instagram.com')) {
    throw new Error('URL Instagram invalide.');
  }

  try {
    const response = await fetch(instagramUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) throw new Error('Impossible de récupérer le profil Instagram.');

    const html = await response.text();
    const $ = cheerio.load(html);

    const sharedDataScript = $('script[type="application/ld+json"]').html();
    if (!sharedDataScript) throw new Error('Données JSON non trouvées.');

    const data = JSON.parse(sharedDataScript);

    // Si le dernier post est visible dans ce script :
    if (data && data.mainEntityofPage && data.mainEntityofPage['@type'] === 'ImageObject') {
      const postUrl = data.mainEntityofPage['@id'];
      const caption = data.mainEntityofPage.caption || 'Nouveau post Instagram';
      const postId = postUrl.split('/p/')[1]?.replace('/', '') || `fallback_${Date.now()}`;
      const timestamp = new Date().toISOString();

      return {
        postId,
        postUrl,
        caption,
        timestamp
      };
    }

    throw new Error('Aucun post trouvé dans le contenu HTML.');

  } catch (error) {
    console.error('[fetchInstagramPost] Erreur :', error.message);
    throw error;
  }
}

module.exports = fetchInstagramPost;