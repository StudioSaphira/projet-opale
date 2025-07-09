// bot/topaze/commands/config/role/roleAddMod.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../../../shared/utils/db');
const logger = require('../../../../../shared/helpers/logger');
const { sendLogConfigToRubis } = require('../../../../../shared/helpers/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config-role-add-mod')
    .setDescription('Ajoute un rôle supplémentaire autorisé comme modérateur')
    .addRoleOption(option =>
      option
        .setName('rôle')
        .setDescription('Le rôle à ajouter comme rôle modérateur')
        .setRequired(true)
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const user = interaction.user;

    const ownerIds = process.env.OWNER_ID?.split(',') || [];
    const altOwnerIds = process.env.ALT_OWNER_ID?.split(',') || [];
    const adminIds = process.env.ADMIN_ID?.split(',') || [];

    const isOwner = ownerIds.includes(userId);
    const isAltOwner = altOwnerIds.includes(userId);
    const isAdminId = adminIds.includes(userId);

    if (!isOwner && !isAltOwner && !isAdminId) {
      return interaction.reply({
        content: '⛔ Seuls les propriétaires ou administrateurs globaux peuvent utiliser cette commande.',
        flags: 64
      });
    }

    const selectedRole = interaction.options.getRole('rôle');

    try {
      const current = db.prepare('SELECT mod_id FROM role WHERE guild_id = ?').get(guildId);
      let currentIds = current?.mod_id || '';

      let ids = currentIds ? currentIds.split(',').map(id => id.trim()) : [];

      if (ids.includes(selectedRole.id)) {
        return interaction.reply({
          content: `⚠️ Ce rôle est déjà défini comme modérateur.`,
          flags: 64
        });
      }

      ids.push(selectedRole.id);
      const newIds = ids.join(',');

      db.prepare(`
        INSERT INTO role (guild_id, mod_id)
        VALUES (?, ?)
        ON CONFLICT(guild_id) DO UPDATE SET mod_id = excluded.mod_id
      `).run(guildId, newIds);

      const embed = {
        title: '✅ Rôle Modérateur Ajouté',
        description: `Le rôle <@&${selectedRole.id}> (\`${selectedRole.id}\`) a été ajouté à la liste des rôles modérateurs.`,
        color: 0x00FF00,
        footer: { text: `Ajouté par ${user.tag}` },
        timestamp: new Date().toISOString(),
      };

      await interaction.reply({ embeds: [embed], flags: 64 });

      const logMessage = `Un rôle modérateur a été ajouté : <@&${selectedRole.id}> (\`${selectedRole.id}\`) — Liste actuelle : \`${newIds}\``;

      logger.info(`[Topaze] ${logMessage}`);

      await sendLogConfigToRubis(
        interaction.guild,
        interaction.user,
        logMessage,
        interaction.client,
        'Configuration : Rôles / Mod',
        '🔨'
      );

    } catch (error) {
      logger.error(`[Topaze] Erreur DB – /config-role-add-mod : ${error.stack}`);
      return interaction.reply({
        content: '❌ Une erreur est survenue lors de l’enregistrement.',
        flags: 64
      });
    }
  }
};