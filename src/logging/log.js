const winston = require('winston');
const path = require('path');
const moment = require('moment-timezone');

module.exports = function(fileName) {    
    const logger = winston.createLogger({
        level: 'info',
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.printf(info => `${moment(info.timestamp).tz('Europe/Berlin').format()} - ${path.basename(fileName)} [${info.level}]: ${info.message}`)
              )
          })
        ]
    });

    return logger;
}