// bot/peridot/commands/tâche-supprimer.js

const { SlashCommandBuilder } = require('discord.js');
const db = require('../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tâche-supprimer')
    .setDescription('Supprime une tâche planifiée existante.')
    .addIntegerOption(option =>
      option.setName('id')
        .setDescription('ID de la tâche à supprimer (utilise /tâche-lister pour voir les ID)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user_id = interaction.user.id;
    const task_id = interaction.options.getInteger('id');

    try {
      // Vérifier que la tâche existe et appartient bien à l'utilisateur
      const row = db.prepare(`
        SELECT * FROM tâches_planifiées
        WHERE id = ? AND user_id = ?
      `).get(task_id, user_id);

      if (!row) {
        return interaction.reply({
          content: `❌ Aucune tâche avec l'ID **${task_id}** ne t'appartient.`,
          flags: 64
        });
      }

      // Suppression
      db.prepare(`DELETE FROM tâches_planifiées WHERE id = ?`).run(task_id);

      await interaction.reply({
        content: `✅ La tâche **#${task_id}** a bien été supprimée.`,
        flags: 64
      });

    } catch (err) {
      console.error('Erreur /tâche-supprimer :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de la suppression de la tâche.',
        flags: 64
      });
    }
  }
};