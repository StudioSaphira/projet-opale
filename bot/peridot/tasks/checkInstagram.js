// bot/peridot/tasks/checkInstagram.js

const db = require('../../../shared/utils/db');
const { EmbedBuilder } = require('discord.js');

// FONCTION FACTICE – à remplacer par une API réelle ou un scraper
async function getLatestInstagramPost(instagramUrl) {
  // Simuler une récupération d’ID de post
  return {
    postId: `mock_${Math.floor(Math.random() * 10000)}`, // unique pour le test
    postUrl: `${instagramUrl}/p/POST_ID`,
    caption: 'Nouveau post Instagram !',
    timestamp: new Date().toISOString()
  };
}

module.exports = async function checkInstagram(client) {
  const profils = db.prepare(`
    SELECT id, user_id, username, instagram_url
    FROM automatisation_peridot
    WHERE instagram_url IS NOT NULL AND is_active = 1
  `).all();

  for (const profil of profils) {
    try {
      const post = await getLatestInstagramPost(profil.instagram_url);

      const déjàEnvoyé = db.prepare(`
        SELECT 1 FROM annonces_envoyées
        WHERE profile_id = ? AND platform = 'instagram' AND post_id = ?
      `).get(profil.id, post.postId);

      if (déjàEnvoyé) continue;

      // Construire l'embed
      const embed = new EmbedBuilder()
        .setTitle(`📸 Nouveau post Instagram de ${profil.username}`)
        .setDescription(post.caption)
        .setURL(post.postUrl)
        .setColor(0xe1306c)
        .setTimestamp(new Date(post.timestamp))
        .setFooter({ text: 'Instagram' });

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
          VALUES (?, 'instagram', ?)
        `).run(profil.id, post.postId);
      }

    } catch (err) {
      console.error(`[Instagram] Erreur pour ${profil.username}:`, err);
    }
  }
};