const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const db = require('../../../../shared/utils/db');
const logger = require('../../../../shared/helpers/logger');
const { createDataEmbed } = require('../../../../shared/utils/embed/topaze/data');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('data-all')
    .setDescription('Affiche les données de configuration pour tous les serveurs enregistrés'),

  async execute(interaction) {
    const userId = interaction.user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    if (!ownerIds.includes(userId) && !altOwnerIds.includes(userId) && !adminIds.includes(userId)) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    // Récupère tous les guild_id uniques
    const rows = db.prepare('SELECT DISTINCT guild_id FROM role').all();
    if (!rows || rows.length === 0) {
      return interaction.reply({
        content: 'Aucune donnée trouvée.',
        flags: 64
      });
    }

    let index = 0;

    const showEmbed = async (i) => {
      const guildId = rows[i].guild_id;

      const guild = interaction.client.guilds.cache.get(guildId);
      if (!guild) {
        logger.warn(`[Topaze] Guild ${guildId} non trouvée.`);
      }

      const data = {
        channel_log: db.prepare('SELECT * FROM channel_log WHERE guild_id = ?').get(guildId) || {},
        channel_welcome: db.prepare('SELECT * FROM channel_welcome WHERE guild_id = ?').get(guildId) || {},
        channel_leaving: db.prepare('SELECT * FROM channel_leaving WHERE guild_id = ?').get(guildId) || {},
        channel_birthday: db.prepare('SELECT * FROM channel_birthday WHERE guild_id = ?').get(guildId) || {},
        channel_voice: db.prepare('SELECT * FROM channel_voice WHERE guild_id = ?').get(guildId) || {},
        channel_counter: db.prepare('SELECT * FROM channel_counter WHERE guild_id = ?').get(guildId) || {},
        category: db.prepare('SELECT * FROM category WHERE guild_id = ?').get(guildId) || {},
        role: db.prepare('SELECT * FROM role WHERE guild_id = ?').get(guildId) || {}
      };

      const embed = createDataEmbed(data, guild || { name: 'Inconnu', id: guildId }, i, rows.length);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`data_prev_${i}`)
          .setLabel('⬅️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(i === 0),

        new ButtonBuilder()
          .setCustomId(`data_invite_${guildId}`)
          .setLabel('#️⃣')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId(`data_next_${i}`)
          .setLabel('➡️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(i === rows.length - 1)
      );

      return { embed, row };
    };

    const { embed, row } = await showEmbed(index);

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
      ephemeral: true
    });

    const collector = reply.createMessageComponentCollector({
      time: 5 * 60 * 1000
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== userId) return i.reply({ content: '⛔ Non autorisé.', ephemeral: true });

      if (i.customId.startsWith('data_prev_')) {
        index = Math.max(0, index - 1);
      } else if (i.customId.startsWith('data_next_')) {
        index = Math.min(rows.length - 1, index + 1);
      } else if (i.customId.startsWith('data_invite_')) {
        const guildId = i.customId.split('_')[2];
        const guild = interaction.client.guilds.cache.get(guildId);
        if (!guild) return i.reply({ content: '❌ Impossible de créer une invitation.', ephemeral: true });

        let channelId = db.prepare('SELECT channel_id FROM channel_welcome WHERE guild_id = ?').get(guildId)?.channel_id;
        let channel = guild.channels.cache.get(channelId);

        if (!channel) {
          // Fallback sur le premier salon texte
          channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText);
        }

        if (!channel) {
          return i.reply({ content: '❌ Aucun salon disponible pour créer une invitation.', ephemeral: true });
        }

        try {
          const invite = await channel.createInvite({ maxAge: 3600, unique: true });
          return i.reply({ content: `🔗 Invitation temporaire (1h) : ${invite.url}`, ephemeral: true });
        } catch (err) {
          logger.error(`[Topaze] Erreur création d'invitation : ${err.stack}`);
          return i.reply({ content: '❌ Erreur lors de la création de l’invitation.', ephemeral: true });
        }
      }

      const { embed: newEmbed, row: newRow } = await showEmbed(index);
      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', () => {
      logger.info(`[Topaze] /data-all terminé pour ${interaction.user.tag}`);
    });
  }
};