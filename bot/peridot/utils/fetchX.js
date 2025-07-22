// bot/peridot/utils/fetchX.js

const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Récupère le dernier post d’un compte X/Twitter via flux Nitter
 * @param {string} twitterUrl - URL du profil (ex: https://twitter.com/elonmusk)
 * @param {string} [mirror='https://nitter.net'] - Miroir Nitter (personnalisable)
 * @returns {Promise<{ postId: string, postUrl: string, caption: string, timestamp: string }>}
 */
async function fetchLatestXPost(twitterUrl, mirror = 'https://nitter.net') {
  const match = twitterUrl.match(/twitter\.com\/([a-zA-Z0-9_]+)/i);
  if (!match) throw new Error('URL X invalide.');

  const username = match[1];
  const rssUrl = `${mirror}/${username}/rss`;

  try {
    const feed = await parser.parseURL(rssUrl);
    if (!feed?.items || feed.items.length === 0) throw new Error('Aucun tweet trouvé.');

    const latest = feed.items[0];

    return {
      postId: latest.id || latest.link,
      postUrl: latest.link,
      caption: latest.title || latest.contentSnippet || 'Nouveau post sur X.',
      timestamp: new Date(latest.pubDate || Date.now()).toISOString()
    };

  } catch (err) {
    console.error('[fetchXPost] Erreur :', err.message);
    throw err;
  }
}

module.exports = fetchLatestXPost;