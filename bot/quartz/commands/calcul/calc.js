// bot/quartz/commands/calcul/calc.js

const { SlashCommandBuilder } = require('discord.js');
const { sendLogCalcToRubis } = require('../../../../shared/helpers/logger');
const { createCalcEmbed } = require('../../../../shared/utils/embed/embedQuartzCalc');
const math = require('mathjs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('💡 Résout une expression mathématique simple.')
    .addStringOption(option =>
      option.setName('expression')
        .setDescription('Exemple : 3 + 5 * (2 - 1)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const expression = interaction.options.getString('expression');
    const { guild, user, client } = interaction;

    let result;
    try {
      result = math.evaluate(expression);
    } catch (err) {
      return interaction.reply({
        embeds: [
          createCalcEmbed({ error: true, expression })
        ],
        flags: 64
      });
    }

    // Envoi de l'embed
    const embed = createCalcEmbed({ expression, result, user });
    await interaction.reply({ embeds: [embed] });

    // Log vers Rubis
    await sendLogCalcToRubis(
      guild,
      user,
      `🧮 Expression : \`${expression}\`\n📥 Résultat : \`${result}\``,
      client
    );
  }
};