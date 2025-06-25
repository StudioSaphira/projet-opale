const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const db = require('../../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset-all')
    .setDescription('Réinitialise toute la configuration du serveur'),

  async execute(interaction) {
    const ownerIds = process.env.OWNER_ID.split(',');
    const isOwner = ownerIds.includes(interaction.user.id);

    if (!isOwner) {
      console.warn(`[TOPAZE] ❌ Tentative de reset non autorisée par ${interaction.user.tag} (${interaction.user.id}) dans ${interaction.guild?.name || 'Inconnu'} (${interaction.guild?.id || 'n/a'})`);
      return interaction.reply({
        content: '⛔ Seuls les propriétaires du projet peuvent réinitialiser la configuration.',
        flags: MessageFlags.Ephemeral
      });
    }

    const guildId = interaction.guild.id;

    try {
      db.prepare('DELETE FROM server_config WHERE guild_id = ?').run(guildId);

      await interaction.reply({
        content: `✅ La configuration du serveur a été réinitialisée avec succès.`,
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('[TOPAZE] Erreur lors de la commande /reset :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de la réinitialisation.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};