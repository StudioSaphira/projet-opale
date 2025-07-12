// bot/onyx/commands/data/reloadConfig.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reloadconfig')
    .setDescription('Recharge le fichier .env (configuration du bot).'),

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

    try {
      const envPath = path.resolve(__dirname, '../../../../.env');
      dotenv.config({ path: envPath });

      const embed = new EmbedBuilder()
        .setTitle('🔁 Configuration rechargée')
        .setDescription(`Les variables du fichier \`.env\` ont été rechargées avec succès.`)
        .setColor(0x3498db)
        .setTimestamp();

      console.log('🔄 .env rechargé par commande /reloadconfig');

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('❌ Erreur lors du rechargement de la config :', error);

      await interaction.reply({
        content: '❌ Une erreur est survenue lors du rechargement du fichier `.env`.',
        flags: 64
      });
    }
  }
};