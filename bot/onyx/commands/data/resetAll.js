// bot/onyx/commands/data/resetAll.js

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetall')
    .setDescription('Réinitialise entièrement la base de données Saphira (IRRÉVERSIBLE).'),

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

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('confirm_reset_db')
        .setLabel('✅ Confirmer')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('cancel_reset_db')
        .setLabel('❌ Annuler')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: '⚠️ Cette action **supprimera toutes les données** de la base `saphira.sqlite`.\nSouhaites-tu vraiment continuer ?',
      components: [row],
      flags: 64
    });

    const confirmation = await interaction.channel.awaitMessageComponent({
      componentType: ComponentType.Button,
      time: 15_000
    }).catch(() => null);

    if (!confirmation) {
      return interaction.editReply({
        content: '⏱️ Temps écoulé. Réinitialisation annulée.',
        components: []
      });
    }

    if (confirmation.customId === 'cancel_reset_db') {
      return confirmation.update({
        content: '❌ Réinitialisation annulée.',
        components: []
      });
    }

    if (confirmation.customId === 'confirm_reset_db') {
      const dbPath = path.resolve(__dirname, '../../../../shared/system/database/saphira.sqlite');

      try {
        fs.unlinkSync(dbPath); // Supprime le fichier SQLite
        // Optionnel : recrée un fichier vide ou appelle setupDatabase.js
        // require('../../../../shared/system/database/setupDatabase')();

        await confirmation.update({
          content: '✅ Base de données supprimée avec succès.',
          components: []
        });

        console.log('🗑️ Base de données saphira.sqlite supprimée par commande /resetall');
      } catch (err) {
        console.error('Erreur lors de la suppression de la base de données :', err);
        await confirmation.update({
          content: '❌ Une erreur est survenue lors de la suppression.',
          components: []
        });
      }
    }
  }
};