// bot/peridot/tasks/checkRSS.js

const db = require('../../../shared/utils/db');
const { EmbedBuilder } = require('discord.js');
const Parser = require('rss-parser');
const parser = new Parser();

module.exports = async function checkRSS(client) {
  const flux = db.prepare(`
    SELECT * FROM flux_rss_peridot
    WHERE is_active = 1
  `).all();

  for (const item of flux) {
    try {
      const feed = await parser.parseURL(item.url);
      if (!feed || !feed.items || feed.items.length === 0) continue;

      // Le plus récent en premier
      const latest = feed.items[0];
      if (!latest.guid || latest.guid === item.last_guid) continue;

      // Met à jour la base
      db.prepare(`
        UPDATE flux_rss_peridot SET last_guid = ? WHERE id = ?
      `).run(latest.guid, item.id);

      // Construction de l'embed
      const embed = new EmbedBuilder()
        .setTitle(latest.title || 'Nouveau contenu')
        .setURL(latest.link || item.url)
        .setDescription(latest.contentSnippet?.slice(0, 200) || 'Nouvel article publié.')
        .setColor(0x3498db)
        .setFooter({ text: item.name || 'Flux RSS' })
        .setTimestamp(new Date(latest.pubDate || Date.now()));

      const salon = client.channels.cache.get(item.salon_id);
      if (salon) await salon.send({ embeds: [embed] });

    } catch (err) {
      console.error(`[RSS] Erreur avec le flux ${item.url}:`, err);
    }
  }
};