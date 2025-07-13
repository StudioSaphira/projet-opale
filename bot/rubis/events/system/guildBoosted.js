// bot/rubis/events/system/guildBoosted.js

const db = require('../../../../shared/utils/db');
const { buildCosmeticEmbed } = require('../../../../shared/utils/embed/rubis/log');

module.exports = {
  name: 'guildUpdate',

  async execute(oldGuild, newGuild, client) {
    try {
      const oldBoosts = oldGuild.premiumSubscriptionCount;
      const newBoosts = newGuild.premiumSubscriptionCount;

      if (newBoosts > oldBoosts) {
        const boostCount = newBoosts - oldBoosts;

        // === 1) Récupérer le salon de log pour guildBoosted
        const row = db.prepare(`SELECT channel_id FROM channel_log WHERE type = ?`).get('guildBoosted');
        if (!row || !row.channel_id) {
          console.warn('⚠️ Aucun salon de log défini pour guildBoosted.');
          return;
        }

        const logChannel = await client.channels.fetch(row.channel_id).catch(() => null);
        if (!logChannel) {
          console.warn(`⚠️ Salon de log introuvable : ${row.channel_id}`);
          return;
        }

        // === 2) Créer l’embed
        const embed = buildCosmeticEmbed(
          'Serveur boosté',
          `${boostCount} nouveau(x) boost(s) sur **${newGuild.name}** !`,
          [
            {
              name: 'Nombre total de boosts',
              value: `${newBoosts}`,
              inline: true
            },
            {
              name: 'Niveau Nitro',
              value: `${newGuild.premiumTier}`,
              inline: true
            }
          ]
        );

        // === 3) Envoyer l’embed
        await logChannel.send({ embeds: [embed] });
        console.log(`🚀 Boost détecté sur ${newGuild.name} (+${boostCount})`);
      }

    } catch (err) {
      console.error(`❌ Erreur guildBoosted :`, err);
    }
  }
};