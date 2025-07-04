// shared/helpers/logger.js

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Format timestamp lisible
const logFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
});

// Transport fichier avec rotation quotidienne
const dailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(__dirname, '../../../logs/topaze-%DATE%.log'),
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,         // Si true, zippe les vieux logs
  maxFiles: '7d',              // Conserve 7 jours
  level: 'info'
});

// Création du logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    logFormat
  ),
  transports: [
    dailyRotateTransport,
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        logFormat
      )
    })
  ]
});

module.exports = {
  log: (message) => logger.info(message),
  error: (message) => logger.error(message)
};