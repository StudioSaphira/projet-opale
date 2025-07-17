// shared/utils/embed/opale/featureStatusEmbed.js

const { EmbedBuilder } = require('discord.js');
const db = require('../../db');

// Liste des bots et de leurs fonctionnalités connues
const botFeatures = {
  diamant: ['modération', 'infractions', 'sanctions', 'anti-raid'],
  emeraude: ['tickets support', 'tickets contact'],
  saphir: ['suivi des arrivées', 'suivi des départs'],
  rubis: ['logs modération', 'logs système'],
  topaze: ['configuration dynamique', 'commandes globales'],
  quartz: ['compteurs', 'statistiques', 'graphes'],
  turquoise: ['profils RP', 'profils joueurs'],
  lazulite: ['wiki commandes', 'wiki projets'],
};

module.exports = async function generateFeatureStatusEmbed(guildId) {
  const embed = new EmbedBuilder()
    .setTitle('📊 Fonctionnalités activées')
    .setDescription(`État des fonctionnalités activées pour le serveur \`${guildId}\`.`)
    .setColor(0x2ECC71)
    .setTimestamp();

  try {
    // Exemple : lecture de la table "config" qui contient les options enregistrées
    const rows = db.prepare('SELECT * FROM config WHERE guild_id = ?').all(guildId);

    const grouped = {};
    for (const row of rows) {
      const bot = row.bot;
      if (!grouped[bot]) grouped[bot] = [];
      grouped[bot].push(row.feature);
    }

    for (const botName of Object.keys(botFeatures)) {
      const features = grouped[botName] || [];
      const allKnown = botFeatures[botName];

      const lines = allKnown.map(f => {
        return features.includes(f) ? `✅ ${f}` : `❌ ${f}`;
      });

      embed.addFields({
        name: `🤖 ${botName.charAt(0).toUpperCase() + botName.slice(1)}`,
        value: lines.join('\n'),
        inline: true,
      });
    }

    return embed;
  } catch (err) {
    console.error('[Opale] Erreur lors de la génération de featureStatusEmbed :', err);
    return new EmbedBuilder()
      .setTitle('Erreur')
      .setDescription('Impossible de charger les fonctionnalités pour ce serveur.')
      .setColor(0xE74C3C);
  }
};