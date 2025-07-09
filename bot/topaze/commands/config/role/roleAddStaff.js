// bot/topaze/commands/config/role/roleAddStaff.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-add-staff')
    .setDescription('Ajoute un rôle supplémentaire autorisé comme staff général')
    .addRoleOption(option =>
      option
        .setName('rôle')
        .setDescription('Le rôle à ajouter comme rôle staff général')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    // Vérifie si l'utilisateur possède le role admin_id en DB
    const row = db.prepare('SELECT admin_id FROM role WHERE guild_id = ?').get(guildId);
    const roleAdminIds = row?.admin_id ? row.admin_id.split(',').map(id => id.trim()) : [];
    const isAdminRole = roleAdminIds.some(id => interaction.member.roles.cache.has(id));

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    if (!isOwner && !isAltOwner && !isAdminId && !isAdminRole) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires, administrateurs globaux ou administrateurs serveur peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const selectedRole = interaction.options.getRole('rôle');

    try {
      const current = db.prepare('SELECT allstaff_id FROM role WHERE guild_id = ?').get(guildId);
      let currentIds = current?.allstaff_id || '';

      let ids = currentIds ? currentIds.split(',').map(id => id.trim()) : [];

      if (ids.includes(selectedRole.id)) {
        return interaction.reply({
          content: `⚠️ Ce rôle est déjà défini comme staff général.`,
          flags: 64
        });
      }

      ids.push(selectedRole.id);
      const newIds = ids.join(',');

      db.prepare(`
        INSERT INTO role (guild_id, allstaff_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET allstaff_id = excluded.allstaff_id
      `).run(guildId, newIds);

      const embed = {
        title: '✅ Rôle Staff Général Ajouté',
        description: `Le rôle <@&${selectedRole.id}> (\`${selectedRole.id}\`) a été ajouté à la liste des rôles staff général.`,
        color: 0x00FF00,
        footer: { text: `Ajouté par ${user.tag}` },
        timestamp: new Date().toISOString(),
      };

      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = `Un rôle staff général a été ajouté : <@&${selectedRole.id}> (\`${selectedRole.id}\`) — Liste actuelle : \`${newIds}\``;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🛡️'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-role-add-staff : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};