// bot/peridot/commands/tâche-ajouter.js

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const db = require('../../../shared/utils/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tâche-ajouter')
    .setDescription('Ajoute une tâche programmée quotidienne.')
    .addChannelOption(option =>
      option.setName('salon')
        .setDescription('Salon où envoyer le message')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .addStringOption(option =>
      option.setName('horaire')
        .setDescription('Heure d’envoi (format 24h: HH:MM)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Contenu du message à envoyer')
        .setRequired(true)),

  async execute(interaction) {
    const user_id = interaction.user.id;
    const channel = interaction.options.getChannel('salon');
    const horaire = interaction.options.getString('horaire');
    const contenu = interaction.options.getString('message');

    // Vérification rapide du format horaire (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(horaire)) {
      return interaction.reply({
        content: '❌ Format horaire invalide. Utilise HH:MM (ex : 18:30).',
        flags: 64
      });
    }

    try {
      db.prepare(`
        INSERT INTO tâches_planifiées (user_id, channel_id, contenu, horaire)
        VALUES (?, ?, ?, ?)
      `).run(user_id, channel.id, contenu, horaire);

      await interaction.reply({
        content: `✅ Tâche ajoutée : le message sera envoyé chaque jour à **${horaire}** dans <#${channel.id}>.`,
        flags: 64
      });
    } catch (err) {
      console.error('Erreur /tâche-ajouter :', err);
      await interaction.reply({
        content: '❌ Une erreur est survenue lors de l’ajout de la tâche.',
        flags: 64
      });
    }
  }
};