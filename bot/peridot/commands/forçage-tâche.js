// bot/peridot/commands/forçage-tâche.js

const { SlashCommandBuilder } = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forçage-tâche')
    .setDescription('Force l’exécution immédiate d’une tâche d’automatisation.')
    .addStringOption(option =>
      option.setName('nom')
        .setDescription('Nom de la tâche à exécuter (ex: youtube, twitch)')
        .setRequired(true)
        .addChoices(
          { name: 'YouTube', value: 'checkYouTube' },
          { name: 'Twitch', value: 'checkTwitch' },
          { name: 'Messages programmés', value: 'postScheduledMessages' },
          { name: 'Flux RSS', value: 'checkRSS' } // si applicable
        )
    ),

  async execute(interaction) {
    const taskName = interaction.options.getString('nom');
    const filePath = path.join(__dirname, '../tasks/', `${taskName}.js`);

    try {
      const task = require(filePath);

      if (typeof task !== 'function') {
        return interaction.reply({
          content: `❌ La tâche \`${taskName}\` n’est pas exécutable.`,
          flags: 64,
        });
      }

      await task(interaction.client); // on passe le client à la fonction
      await interaction.reply({
        content: `✅ La tâche \`${taskName}\` a été exécutée immédiatement.`,
        flags: 64,
      });

    } catch (error) {
      console.error(`[forçage-tâche] Erreur avec ${taskName}:`, error);
      await interaction.reply({
        content: `❌ Impossible d’exécuter la tâche \`${taskName}\`. Vérifie son nom ou consulte la console.`,
        flags: 64,
      });
    }
  }
};