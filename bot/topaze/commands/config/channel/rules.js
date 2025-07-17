// bot/topaze/commands/config/channel/rules.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/config');
const logger = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-channel-rules')
    .setDescription('Définit le salon des règles du serveur')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Le salon à définir comme salon des règles')
        .setRequired(true)
    ),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const member = interaction.member;

    // Vérification du rôle admin depuis la table
    const row = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
    const dbAdminRole = row?.admin_id;

    const isAllowed =
      ownerIds.includes(userId) ||
      altOwnerIds.includes(userId) ||
      adminIds.includes(userId) ||
      (dbAdminRole && member.roles.cache.has(dbAdminRole));

    if (!isAllowed) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    const channel = interaction.options.getChannel('salon');

    try {
      db.prepare(`
        CREATE TABLE IF NOT EXISTS channel_rules (
          guild_id TEXT PRIMARY KEY,
          channel_id TEXT,
          old_channel_id TEXT
        );
      `).run();

      const existing = db.prepare('SELECT channel_id FROM channel_rules WHERE guild_id = ?').get(guildId);
      const oldId = existing?.channel_id || null;

      db.prepare(`
        INSERT INTO channel_rules (guild_id, channel_id, old_channel_id)
        VALUES (?, ?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET
          old_channel_id = channel_rules.channel_id,
          channel_id = excluded.channel_id
      `).run(guildId, channel.id, oldId);

      const embed = createConfigEmbed('channel_rules', channel.id, interaction.user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le salon des règles a été mis à jour : <#${channel.id}> (\`${channel.id}\`)`,
        interaction.client,
        'Configuration : Salons',
        '📕'
      );
    } catch (err) {
      logger.error(`[Topaze] ❌ Erreur config-channel-rules : ${err.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de la configuration.',
        flags: 64
      });
    }
  }
};