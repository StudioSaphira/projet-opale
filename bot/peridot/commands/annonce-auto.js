// bot/peridot/commands/annonce-auto.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('annonce-auto')
    .setDescription('Ajoute ou modifie ton profil d’annonces automatisées.')
    .addStringOption(opt =>
      opt.setName('username')
        .setDescription('Nom affiché du créateur/streamer')
        .setRequired(true))
    .addStringOption(opt =>
      opt.setName('avatar')
        .setDescription('Lien vers l’avatar ou logo personnalisé'))
    .addStringOption(opt =>
      opt.setName('description')
        .setDescription('Description du profil (optionnelle)'))
    .addStringOption(opt =>
      opt.setName('youtube')
        .setDescription('Lien vers la chaîne YouTube'))
    .addStringOption(opt =>
      opt.setName('twitch')
        .setDescription('Lien vers le profil Twitch'))
    .addStringOption(opt =>
      opt.setName('twitter')
        .setDescription('Lien vers le profil Twitter/X'))
    .addStringOption(opt =>
      opt.setName('tiktok')
        .setDescription('Lien vers le profil TikTok'))
    .addStringOption(opt =>
      opt.setName('instagram')
        .setDescription('Lien vers le profil Instagram')),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.options.getString('username');
    const avatar_url = interaction.options.getString('avatar');
    const description = interaction.options.getString('description');
    const youtube_url = interaction.options.getString('youtube');
    const twitch_url = interaction.options.getString('twitch');
    const twitter_url = interaction.options.getString('twitter');
    const tiktok_url = interaction.options.getString('tiktok');
    const instagram_url = interaction.options.getString('instagram');

    try {
      // Vérifie si un profil existe déjà pour cet utilisateur
      const existing = db.prepare(`SELECT id FROM automatisation_peridot WHERE user_id = ?`).get(userId);

      if (existing) {
        db.prepare(`
          UPDATE automatisation_peridot
          SET username = ?, avatar_url = ?, description = ?, youtube_url = ?, twitch_url = ?, twitter_url = ?, tiktok_url = ?, instagram_url = ?
          WHERE user_id = ?
        `).run(username, avatar_url, description, youtube_url, twitch_url, twitter_url, tiktok_url, instagram_url, userId);
      } else {
        db.prepare(`
          INSERT INTO automatisation_peridot (user_id, username, avatar_url, description, youtube_url, twitch_url, twitter_url, tiktok_url, instagram_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, username, avatar_url, description, youtube_url, twitch_url, twitter_url, tiktok_url, instagram_url);
      }

      const embed = new EmbedBuilder()
        .setTitle('📢 Profil automatisé enregistré')
        .setDescription(`Ton profil d’annonces a été ${existing ? 'mis à jour' : 'créé'} avec succès.`)
        .setColor(0x00cc99)
        .setTimestamp()
        .addFields(
          { name: '👤 Nom', value: username, inline: true },
          { name: '📄 Description', value: description || 'Aucune', inline: true },
          { name: '📺 YouTube', value: youtube_url || 'Non défini', inline: false },
          { name: '🎮 Twitch', value: twitch_url || 'Non défini', inline: true },
          { name: '🐦 Twitter', value: twitter_url || 'Non défini', inline: true },
          { name: '🎵 TikTok', value: tiktok_url || 'Non défini', inline: true },
          { name: '📸 Instagram', value: instagram_url || 'Non défini', inline: true },
        );

      if (avatar_url) embed.setThumbnail(avatar_url);

      await interaction.reply({ embeds: [embed], flags: 64 });

    } catch (err) {
      console.error('Erreur /annonce-auto :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement du profil.',
        flags: 64,
      });
    }
  }
};