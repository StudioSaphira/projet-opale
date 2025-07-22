// bot/peridot/utils/fetchYouTube.js

const Parser = require('rss-parser');
const parser = new Parser();

/**
 * Récupère la dernière vidéo publiée sur une chaîne YouTube via RSS.
 * @param {string} youtubeUrl - URL de la chaîne (ex: https://www.youtube.com/channel/UC12345...)
 * @returns {Promise<{
 *   postId: string,
 *   postUrl: string,
 *   caption: string,
 *   timestamp: string,
 *   thumbnail: string
 * }>}
 */
async function fetchLatestYoutubeVideo(youtubeUrl) {
  const match = youtubeUrl.match(/channel\/([a-zA-Z0-9_-]+)/i);
  if (!match) throw new Error('URL YouTube invalide (doit contenir /channel/...).');

  const channelId = match[1];
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const feed = await parser.parseURL(rssUrl);
    if (!feed?.items || feed.items.length === 0) throw new Error('Aucune vidéo trouvée.');

    const latest = feed.items[0];

    return {
      postId: latest.id,
      postUrl: latest.link,
      caption: latest.title,
      timestamp: new Date(latest.pubDate || Date.now()).toISOString(),
      thumbnail: `https://i.ytimg.com/vi/${latest.link.split('v=')[1] || latest.id.split(':').pop()}/hqdefault.jpg`
    };
  } catch (err) {
    console.error('[fetchYoutubeVideo] Erreur :', err.message);
    throw err;
  }
}

module.exports = fetchLatestYoutubeVideo;