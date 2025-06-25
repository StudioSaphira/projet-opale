const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const { createConfigEmbed } = require('../../../../../shared/utils/embed/topaze/embedTopazeConfig');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-admin')
    .setDescription('Définir le rôle admin autorisé à utiliser les commandes de configuration')
    .addRoleOption(option =>
      option
        .setName('rôle')
        .setDescription('Rôle qui aura les permissions d’administration de configuration')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const user = interaction.user;
    const role = interaction.options.getRole('rôle');

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    if (!ownerIds.includes(user.id)) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent utiliser cette commande.',
        flags: 64
      });
    }

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_admin_id = excluded.role_admin_id
      `).run(guild.id, role.id);

      const embed = createConfigEmbed('role_admin_id', role.id, user);
      await interaction.reply({ embeds: [embed], flags: 64 });

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        `Le rôle administrateur a été mis à jour : <@&${role.id}> (\`${role.id}\`)`,
        interaction.client,
        'Configuration : Rôles / Staff',
        '🧑‍💼'
      );
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-role-admin :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};