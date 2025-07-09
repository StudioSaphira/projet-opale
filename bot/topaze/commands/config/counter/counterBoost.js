// bot/topaze/commands/config/counter/counterBoost.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-counter-boost')
    .setDescription('Définit le salon de compteur pour le nombre de boosts')
    .addChannelOption(option =>
      option
        .setName('salon')
        .setDescription('Le salon à utiliser comme compteur de boosts')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement)
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
      const current = db.prepare('SELECT boost_id FROM channel_counter WHERE guild_id = ?').get(guildId);
      const oldChannelId = current?.boost_id;

      if (oldChannelId && oldChannelId !== selectedChannel.id) {
        db.prepare(`
          INSERT INTO channel_counter (guild_id, old_boost_id)
          VALUES (?, ?)
          ON CONFLICT(guild_id) DO UPDATE SET old_boost_id = excluded.old_boost_id
        `).run(guildId, oldChannelId);

        logger.info(`[Topaze] Ancien compteur "boost" sauvegardé : ${oldChannelId}`);
      }

      db.prepare(`
        INSERT INTO channel_counter (guild_id, boost_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET boost_id = excluded.boost_id
      `).run(guildId, selectedChannel.id);

      const embed = createConfigEmbed('channel_counter_boost_id', selectedChannel.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = oldChannelId && oldChannelId !== selectedChannel.id
        ? `Le compteur de boosts a été mis à jour : <#${selectedChannel.id}> (\`${selectedChannel.id}\`) → Ancien : <#${oldChannelId}> (\`${oldChannelId}\`)`
        : `Le compteur de boosts a été défini : <#${selectedChannel.id}> (\`${selectedChannel.id}\`)`;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Compteurs',
        '🚀'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-counter-boost : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};