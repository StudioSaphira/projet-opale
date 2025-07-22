// bot/peridot/tasks/checkTwitch.js*

const db = require('../../../shared/utils/db');
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const TWITCH_API = 'https://api.twitch.tv/helix/streams';

module.exports = async function checkTwitch(client) {
  const profils = db.prepare(`
    SELECT id, user_id, username, twitch_url
    FROM automatisation_peridot
    WHERE twitch_url IS NOT NULL AND is_active = 1
  `).all();

  for (const profil of profils) {
    const twitchUrl = profil.twitch_url;
    const match = twitchUrl.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
    if (!match) continue;

    const login = match[1];

    try {
      const res = await fetch(`${TWITCH_API}?user_login=${login}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': process.env.TWITCH_AUTH_TOKEN
        }
      });

      const data = await res.json();
      const stream = data.data && data.data[0];

      // Si le streamer est offline, on ignore
      if (!stream) continue;

      // Vérifie si ce live a déjà été annoncé
      const postId = stream.id;

      const already = db.prepare(`
        SELECT 1 FROM annonces_envoyées
        WHERE profile_id = ? AND platform = 'twitch' AND post_id = ?
      `).get(profil.id, postId);

      if (already) continue;

      // Crée l'annonce
      const embed = new EmbedBuilder()
        .setTitle(`🔴 ${profil.username} est en live sur Twitch !`)
        .setURL(`https://twitch.tv/${login}`)
        .setDescription(`**${stream.title}**\nJeu : ${stream.game_name || 'Non spécifié'}\n👥 ${stream.viewer_count} spectateurs`)
        .setColor(0x9146ff)
        .setImage(stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360'))
        .setTimestamp(new Date(stream.started_at))
        .setFooter({ text: 'Twitch' });

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
          VALUES (?, 'twitch', ?)
        `).run(profil.id, postId);
      }

    } catch (err) {
      console.error(`[Twitch] Erreur pour ${profil.username} (${login}) :`, err);
    }
  }
};