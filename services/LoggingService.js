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
    let log = {
        when: dateTimeService.getDateTime(),
        error,
    };

    log = { ...log, ...additionalInfo };

    console.error(log);

    const PATH = `${LOGS_DIR}/error/${dateTimeService.getDate()}`;
    if (!fs.existsSync(PATH)) {
        fs.mkdirSync(PATH, {
            recursive: true
        });
    }

    fs.appendFile(`${PATH}/logs`, JSON.stringify({
        time: dateTimeService.getTime(), error
    }) + '\n\n', err => {
        if (err) console.error({ err });
    });
};
