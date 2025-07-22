// bot/peridot/tasks/checkX.js

const db = require('../../../shared/utils/db');
const Parser = require('rss-parser');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser();

module.exports = async function checkX(client) {
  const profils = db.prepare(`
    SELECT id, user_id, username, twitter_url
    FROM automatisation_peridot
    WHERE twitter_url IS NOT NULL AND is_active = 1
  `).all();

  for (const profil of profils) {
    const match = profil.twitter_url.match(/twitter\.com\/([a-zA-Z0-9_]+)/i);
    if (!match) continue;

    const username = match[1];
    const rssUrl = `https://nitter.net/${username}/rss`;

    try {
      const feed = await parser.parseURL(rssUrl);
      if (!feed?.items || feed.items.length === 0) continue;

      const latest = feed.items[0];
      const postId = latest.id || latest.link;

      const déjàEnvoyé = db.prepare(`
        SELECT 1 FROM annonces_envoyées
        WHERE profile_id = ? AND platform = 'x' AND post_id = ?
      `).get(profil.id, postId);

      if (déjàEnvoyé) continue;

      const embed = new EmbedBuilder()
        .setTitle(`🐦 Nouveau post de ${profil.username} sur X`)
        .setDescription(latest.contentSnippet?.slice(0, 250) || 'Nouveau tweet détecté.')
        .setURL(latest.link || profil.twitter_url)
        .setColor(0x1DA1F2)
        .setTimestamp(new Date(latest.pubDate || Date.now()))
        .setFooter({ text: 'X / Twitter' });

      // 🔍 Récupère le salon configuré pour cette guilde
      const channelConfig = db.prepare(`
        SELECT channel_id FROM channel_communication WHERE guild_id = ?
      `).get(profil.guild_id);

      const salon = channelConfig
        ? client.channels.cache.get(channelConfig.channel_id)
        : null;

      if (salon) {
        await salon.send({ embeds: [embed] });

        db.prepare(`
          INSERT INTO annonces_envoyées (profile_id, platform, post_id)
          VALUES (?, 'x', ?)
        `).run(profil.id, postId);
      }

    } catch (err) {
      console.error(`[X/Twitter] Erreur pour ${profil.username} (${rssUrl}) :`, err);
    }
  }
};