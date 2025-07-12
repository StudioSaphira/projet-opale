// bot/onyx/commands/debug/ping.js

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Retourne la latence du bot (réservé OWNER).'),

  ownerOnly: true, // Vérification primaire dans index.js

  async execute(interaction, client) {
    const ownerId = process.env.OWNER_ID;
    const devGuildId = process.env.DEV_GUILD_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: '🚫 Seul le propriétaire peut exécuter cette commande.', flags: 64 });
    }

    if (interaction.guildId !== devGuildId) {
      return interaction.reply({ content: '🚫 Cette commande ne peut être utilisée que sur le serveur de développement.', flags: 64 });
    }

    const sent = await interaction.reply({ content: '⏱️ Calcul du ping...', fetchReply: true });

    const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const wsPing = client.ws.ping;

    const embed = new EmbedBuilder()
      .setTitle('🏓 Pong !')
      .setColor(0x2ECC71)
      .addFields(
        { name: 'Latence API', value: `${apiLatency}ms`, inline: true },
        { name: 'Latence WebSocket', value: `${wsPing}ms`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};