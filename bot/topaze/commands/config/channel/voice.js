// bot/topaze/commands/config/channel/voice.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-channel-voice')
    .setDescription('Configurer le salon vocal de création automatique')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon vocal utilisé pour créer automatiquement des vocaux temporaires')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const row = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
    const roleAdminId = row?.admin_id;

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);
    const isAdminRole = roleAdminId && interaction.member.roles.cache.has(roleAdminId);

    if (!isOwner && !isAltOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas la permission d’utiliser cette commande.',
        flags: 64
      });
    }

    const selectedChannel = interaction.options.getChannel('salon');

    try {
      const current = db.prepare('SELECT channel_id FROM channel_voice WHERE guild_id = ?').get(guildId);
      const oldChannelId = current?.channel_id;

      if (oldChannelId && oldChannelId !== selectedChannel.id) {
        db.prepare(`
          INSERT INTO channel_voice (guild_id, old_channel_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_channel_id = excluded.old_channel_id
        `).run(guildId, oldChannelId);

        logger.info(`[Topaze] Ancien salon vocal sauvegardé : ${oldChannelId}`);
      }

      db.prepare(`
        INSERT INTO channel_voice (guild_id, channel_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET channel_id = excluded.channel_id
      `).run(guildId, selectedChannel.id);

      const embed = createConfigEmbed('channel_voice_id', selectedChannel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = oldChannelId && oldChannelId !== selectedChannel.id
        ? `Le salon vocal de création automatique a été mis à jour : <#${selectedChannel.id}> (\`${selectedChannel.id}\`) → Ancien : <#${oldChannelId}> (\`${oldChannelId}\`)`
        : `Le salon vocal de création automatique a été défini : <#${selectedChannel.id}> (\`${selectedChannel.id}\`)`;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Vocaux',
        '🎙️'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-channel-voice : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};