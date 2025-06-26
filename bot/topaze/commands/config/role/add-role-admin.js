// bot/topaze/commands/config/role/add-role-admin.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../../shared/utils/db');
const { sendLogConfigToRubis } = require('../../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add-role-admin')
    .setDescription('Ajoute un rôle à la liste des rôles admin autorisés à utiliser les commandes de configuration')
    .addRoleOption(option =>
      option.setName('rôle')
        .setDescription('Rôle à ajouter à la liste des rôles admin')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.user;
    const guild = interaction.guild;
    const guildId = guild.id;
    const role = interaction.options.getRole('rôle');

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    if (!ownerIds.includes(user.id)) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent utiliser cette commande.',
        flags: 64
      });
    }

    try {
      const row = db.prepare('SELECT role_admin_id FROM server_config WHERE guild_id = ?').get(guildId);
      const currentIds = row?.role_admin_id?.split(',')?.filter(id => id.trim() !== '') || [];

      if (currentIds.includes(role.id)) {
        return interaction.reply({
          content: `⚠️ Le rôle <@&${role.id}> est déjà présent dans la liste des rôles admin.`,
          flags: 64
        });
      }

      currentIds.push(role.id);
      const updatedIds = currentIds.join(',');

      db.prepare(`
        INSERT INTO server_config (guild_id, role_admin_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET role_admin_id = excluded.role_admin_id
      `).run(guildId, updatedIds);

      await interaction.reply({
        content: `✅ Le rôle <@&${role.id}> a été ajouté à la liste des rôles admin.`,
        flags: 64
      });

      await sendLogConfigToRubis(
        guild,
        user,
        `Le rôle <@&${role.id}> (\`${role.id}\`) a été ajouté à la liste des rôles 'Administrateur'.`,
        interaction.client,
        'Configuration : Rôles / Admin',
        '🧑‍💼'
      );
    } catch (err) {
      console.error('[TOPAZE] Erreur DB – /add-role-admin :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};