const moment = require('moment');

/**
 * This function is used to format date
 * 
 * @param {Date} date Date object to be parsed
 * @param {String} format The format in which the date needs to be presented (Default: YYYY-MM-DD)
 * @returns Formatted string of date
 */
const getDate = (date = new Date(), format = "YYYY-MM-DD") =>
    moment(date).format(format);

/**
 * This function is used to format time
 * 
 * @param {Date} date Date object to be parsed
 * @param {String} format The format in which the time needs to be presented (Default: HH:mm:ss)
 * @returns Formatted string of date
 */
const getTime = (date = new Date(), format = "HH:mm:ss") =>
    moment(date).format(format);

/**
 * This function is used to format datetime
 * 
 * @param {Date} date Date object to be parsed
 * @param {String} format The format in which the datetime needs to be presented (Default: YYYY-MM-DD HH:mm:ss)
 * @returns Formatted string of date
 */
const getDateTime = (date = new Date(), format = "YYYY-MM-DD HH:mm:ss") =>
    moment(date).format(format);

module.exports = {
    getDate, getTime, getDateTime,
};
