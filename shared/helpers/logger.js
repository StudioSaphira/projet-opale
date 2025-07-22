// shared/helpers/logger.js

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Format timestamp lisible
const logFormat = format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [Topaze] ${message}`;
});

// Transport fichier avec rotation quotidienne
const dailyRotateTransport = new transports.DailyRotateFile({
  filename: path.join(__dirname, '../../../logs/topaze-%DATE%.log'),
  datePattern: 'DD-MM-YYYY',
  zippedArchive: true,
  maxFiles: '7d',
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

// Export
module.exports = {
  log: (message) => logger.info(message),
  error: (message) => logger.error(message),
  warn: (message) => logger.warn(message)
};