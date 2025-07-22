// bot/peridot/triggers/cronScheduler.js

const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

module.exports = function cronScheduler(client) {
  const tasksPath = path.join(__dirname, '../tasks');

  // Liste des fichiers de tâches avec leur cron schedule
  const cronTasks = [
    {
      file: 'postScheduledMessages.js',
      schedule: '*/1 * * * *' // chaque minute
    },
    {
      file: 'checkYoutube.js',
      schedule: '*/5 * * * *' // toutes les 5 minutes
    },
    {
      file: 'checkTwitch.js',
      schedule: '*/5 * * * *'
    },
    {
      file: 'checkTikTok.js',
      schedule: '*/10 * * * *'
    },
    {
      file: 'checkInstagram.js',
      schedule: '*/10 * * * *'
    },
    {
      file: 'checkX.js',
      schedule: '*/10 * * * *'
    },
    {
      file: 'checkRSS.js',
      schedule: '*/5 * * * *'
    }
  ];

  for (const { file, schedule } of cronTasks) {
    const taskPath = path.join(tasksPath, file);

    if (!fs.existsSync(taskPath)) {
      console.warn(`[⏰] Tâche ignorée (fichier introuvable) : ${file}`);
      continue;
    }

    const task = require(taskPath);

    if (typeof task !== 'function') {
      console.warn(`[⚠️] Fichier ${file} n'exporte pas une fonction valide.`);
      continue;
    }

    cron.schedule(schedule, () => {
      task(client);
    });

    console.log(`[🕒] Cron démarré pour ${file} → ${schedule}`);
  }
};