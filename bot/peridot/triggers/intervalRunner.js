// bot/peridot/triggers/intervalRunner.js

const fs = require('fs');
const path = require('path');

module.exports = function intervalRunner(client) {
  const tasksPath = path.join(__dirname, '../tasks');
  const intervalInMs = 5 * 60 * 1000; // Toutes les 5 minutes
  const exclusions = ['postScheduledMessages.js']; // à exécuter ailleurs

  const taskFiles = fs.readdirSync(tasksPath)
    .filter(file => file.endsWith('.js') && !exclusions.includes(file));

  const tasks = taskFiles.map(file => {
    const task = require(path.join(tasksPath, file));
    return typeof task === 'function' ? task : null;
  }).filter(Boolean);

  console.log(`[🕒] IntervalRunner chargé avec ${tasks.length} tâche(s) toutes les 5 minutes.`);

  // Exécution initiale
  tasks.forEach(task => task(client));

  // Répétition
  setInterval(() => {
    tasks.forEach(task => task(client));
  }, intervalInMs);
};