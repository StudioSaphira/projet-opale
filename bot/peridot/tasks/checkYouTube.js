// bot/peridot/tasks/checkYoutube.js

const db = require('../../../shared/utils/db');
const Parser = require('rss-parser');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser();

module.exports = async function checkYoutube(client) {
  const profils = db.prepare(`
    SELECT id, user_id, username, youtube_url, guild_id
    FROM automatisation_peridot
    WHERE youtube_url IS NOT NULL AND is_active = 1
  `).all();

  for (const profil of profils) {
    const match = profil.youtube_url.match(/channel\/([a-zA-Z0-9_-]+)/i);
    if (!match) continue;

    const channelId = match[1];
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
      const feed = await parser.parseURL(rssUrl);
      if (!feed?.items || feed.items.length === 0) continue;

      const latest = feed.items[0];
      const postId = latest.id;

      // Vérifie si cette vidéo a déjà été annoncée
      const déjàEnvoyé = db.prepare(`
        SELECT 1 FROM annonces_envoyées
        WHERE profile_id = ? AND platform = 'youtube' AND post_id = ?
      `).get(profil.id, postId);

      if (déjàEnvoyé) continue;

      const embed = new EmbedBuilder()
        .setTitle(`📺 Nouvelle vidéo de ${profil.username}`)
        .setURL(latest.link)
        .setDescription(latest.title)
        .setColor(0xff0000)
        .setTimestamp(new Date(latest.pubDate || Date.now()))
        .setFooter({ text: 'YouTube' });

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
          VALUES (?, 'youtube', ?)
        `).run(profil.id, postId);
      }

    } catch (err) {
      console.error(`[YouTube] Erreur pour ${profil.username} (${profil.youtube_url}) :`, err);
    }
  }
};