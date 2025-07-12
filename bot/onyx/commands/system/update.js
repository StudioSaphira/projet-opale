// bot/onyx/commands/system/update.js

const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('node:child_process');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Met à jour les fichiers du projet Opale depuis Git.'),

  ownerOnly: true,

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    await interaction.reply({ content: '📥 Mise à jour en cours... (git pull)', flags: 64 });

    exec('git pull', { cwd: path.resolve(__dirname, '../../../../') }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erreur de mise à jour : ${error.message}`);
        return interaction.followUp({ content: `❌ Erreur lors de la mise à jour :\n\`\`\`${error.message}\`\`\``, flags: 64 });
      }

      if (stderr) {
        console.warn(`⚠️ Warnings pendant la mise à jour : ${stderr}`);
      }

      console.log(`✅ Mise à jour effectuée :\n${stdout}`);
      interaction.followUp({
        content: `✅ Mise à jour terminée.\n\`\`\`bash\n${stdout}\`\`\``,
        flags: 64
      });
    });
  }
};