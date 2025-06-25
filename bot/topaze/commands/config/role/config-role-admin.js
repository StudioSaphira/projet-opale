const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');

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
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const isOwner = ownerIds.includes(userId);

    if (!isOwner) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const role = interaction.options.getRole('rôle');

    try {
      db.prepare(`
        INSERT INTO server_config (guild_id, role_admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_admin_id = excluded.role_admin_id
      `).run(guildId, role.id);

      return interaction.reply({
        content: `✅ Le rôle admin a été défini : <@&${role.id}> (\`${role.name}\`)`,
        flags: 64
      });
    } catch (error) {
      console.error('[TOPAZE] Erreur DB – /config-role-admin :', error);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};