// bot/topaze/commands/config/role/roleRemoveAdmin.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-remove-admin')
    .setDescription('Retire un rôle de la liste des rôles administrateurs')
    .addRoleOption(option =>
      option
        .setName('rôle')
        .setDescription('Le rôle à retirer de la liste des rôles administrateurs')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);

    if (!isOwner && !isAltOwner) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const selectedRole = interaction.options.getRole('rôle');

    try {
      const current = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
      let currentIds = current?.admin_id || '';

      let ids = currentIds ? currentIds.split(',').map(id => id.trim()) : [];

      if (!ids.includes(selectedRole.id)) {
        return interaction.reply({
          content: `⚠️ Ce rôle n’est pas dans la liste des administrateurs.`,
          flags: 64
        });
      }

      ids = ids.filter(id => id !== selectedRole.id);
      const newIds = ids.join(',');

      db.prepare(`
        INSERT INTO role (guild_id, admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET admin_id = excluded.admin_id
      `).run(guildId, newIds);

      const embed = {
        title: '✅ Rôle Admin Retiré',
        description: `Le rôle <@&${selectedRole.id}> (\`${selectedRole.id}\`) a été retiré de la liste des rôles administrateurs.`,
        color: 0xFF0000,
        footer: { text: `Retiré par ${user.tag}` },
        timestamp: new Date().toISOString(),
      };

      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = `Un rôle admin a été retiré : <@&${selectedRole.id}> (\`${selectedRole.id}\`) — Liste actuelle : \`${newIds}\``;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Rôles / Admin',
        '🧑‍💼'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-role-remove-admin : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de la suppression.',
        flags: 64
      });
    }
  }
};