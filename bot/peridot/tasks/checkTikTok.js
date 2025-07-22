// bot/peridot/tasks/checkTikTok.js

const db = require('../../../shared/utils/db');
const { EmbedBuilder } = require('discord.js');

// ⚠️ Fonction simulée — à remplacer par un vrai système de récupération TikTok
async function getLatestTikTokPost(tiktokUrl) {
  const randomId = Math.floor(Math.random() * 100000);
  return {
    postId: `tiktok_${randomId}`,
    postUrl: `${tiktokUrl}/video/${randomId}`,
    caption: 'Nouvelle vidéo TikTok détectée ! 🎵',
    timestamp: new Date().toISOString()
  };
}

module.exports = async function checkTikTok(client) {
  const profils = db.prepare(`
    SELECT id, user_id, username, tiktok_url
    FROM automatisation_peridot
    WHERE tiktok_url IS NOT NULL AND is_active = 1
  `).all();

  for (const profil of profils) {
    try {
      const post = await getLatestTikTokPost(profil.tiktok_url);

      // Vérifie si déjà annoncé
      const existe = db.prepare(`
        SELECT 1 FROM annonces_envoyées
        WHERE profile_id = ? AND platform = 'tiktok' AND post_id = ?
      `).get(profil.id, post.postId);

      if (existe) continue;

      const embed = new EmbedBuilder()
        .setTitle(`🎵 Nouveau TikTok de ${profil.username}`)
        .setURL(post.postUrl)
        .setDescription(post.caption)
        .setColor(0x010101)
        .setTimestamp(new Date(post.timestamp))
        .setFooter({ text: 'TikTok' });

      const salon = client.channels.cache.get(process.env.CH_TIKTOK); // salon Discord TikTok

      if (salon) {
        await salon.send({ embeds: [embed] });

        db.prepare(`
          INSERT INTO annonces_envoyées (profile_id, platform, post_id)
          VALUES (?, 'tiktok', ?)
        `).run(profil.id, post.postId);
      }

    } catch (err) {
      console.error(`[TikTok] Erreur avec ${profil.username} (${profil.tiktok_url}) :`, err);
    }
  }
};