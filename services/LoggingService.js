const fs = require('fs');
const dateTimeService = require('./DateTimeService');

const LOGS_DIR = './logs';

module.exports = {
    errorLog
};

/**
 * Logging error in file and on console
 * 
 * @param {Error} error error that occured
 */
function errorLog(error, additionalInfo = {}) {
    const log = {
        when: dateTimeService.getDateTime(),
        error,
    };

    log = { ...log, ...additionalInfo };

    console.error(log);
    fs.writeFile(`${LOGS_DIR}/error/${dateTimeService.getDate()}/${dateTimeService.getTime()}`, error);
};
