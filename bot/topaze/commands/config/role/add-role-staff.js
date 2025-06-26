// bot/topaze/commands/config/role/add-role-staff.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-role-staff')
    .setDescription('Ajoute un rôle supplémentaire au staff général autorisé')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Rôle à ajouter comme rôle de staff général autorisé')
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole('rôle');
    const guild = interaction.guild;
    const guildId = guild.id;
    const user = interaction.user;
    const userId = user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    // Récupère la configuration actuelle
    const config = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
    const currentAdminIds = config?.role_admin_id?.split(',').map(r => r.trim()).filter(Boolean) || [];

    const hasAdminRole = currentAdminIds.some(id => interaction.member.roles.cache.has(id));
    const isAllowed = ownerIds.includes(userId) || adminIds.includes(userId) || hasAdminRole;

    if (!isAllowed) {
      return interaction.reply({
        content: '⛔ Vous n’avez pas l’autorisation d’utiliser cette commande.',
        flags: 64
      });
    }

    // Vérifie si l'ID est déjà présent
    if (currentAdminIds.includes(role.id)) {
      return interaction.reply({
        content: `ℹ️ Le rôle <@&${role.id}> est déjà enregistré comme rôle staff.`,
        flags: 64
      });
    }

    try {
      const updatedAdminIds = [...currentAdminIds, role.id].join(',');
      db.prepare(`
        INSERT INTO server_config (guild_id, role_admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_admin_id = excluded.role_admin_id
      `).run(guildId, updatedAdminIds);

      const embed = createConfigEmbed('role_admin_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        guild,
        user,
        `Le rôle <@&${role.id}> (\`${role.id}\`) a été ajouté à la liste des rôles 'Staff'.`,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🛡️'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /add-role-staff :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};