// shared/utils/embed/embedQuartzCalc.js

const { EmbedBuilder } = require('discord.js');

/**
 * Génère un embed de réponse pour la commande /calc.
 * @param {Object} params
 * @param {string} params.expression - L'expression mathématique saisie.
 * @param {number|string} [params.result] - Le résultat calculé (si pas en erreur).
 * @param {User} [params.user] - L'utilisateur à l'origine du calcul.
 * @param {boolean} [params.error=false] - Si true, retourne un embed d'erreur.
 * @returns {EmbedBuilder}
 */
function createCalcEmbed({ expression, result, user, error = false }) {
  if (error) {
    return new EmbedBuilder()
      .setColor('Red')
      .setTitle('❌ Erreur de calcul')
      .setDescription(`L'expression \`${expression}\` est invalide.\nVérifie la syntaxe.`);
  }

  return new EmbedBuilder()
    .setColor('White')
    .setTitle('⬜ Résultat du calcul')
    .addFields(
      { name: '🧮 Expression', value: `\`${expression}\``, inline: false },
      { name: '✅ Résultat', value: `\`${result}\``, inline: false }
    )
    .setFooter({ text: `Demandé par ${user.tag}`, iconURL: user.displayAvatarURL() })
    .setTimestamp();
}

module.exports = { createCalcEmbed };