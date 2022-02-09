const DatabaseConnection = require('./DatabaseConnection');

const { mySqlConnection } = DatabaseConnection;

module.exports = {
    queryDatabase, beginTransaction, commit, rollback
};

/**
 * This function is used to get the output from the database
 * 
 * @param {String} SQL_QUERY This is the query that we need to execute
 * @param {Array} params These are the params that need to be passed in the query
 * @returns Output of the query
 */
async function queryDatabase(SQL_QUERY, params = []) {
    return await new Promise((resolve, reject) => {
        mySqlConnection.getConnection().query(SQL_QUERY, params, function (error, result) {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

/**
 * This function will begin a new transaction
 */
async function beginTransaction() {
    await new Promise((resolve, reject) => {
        mySqlConnection.getConnection().beginTransaction(error => {
            if (error) return reject(error);
            resolve();
        });
    });
};

/**
 * This function will commit the transaction
 */
async function commit() {
    await new Promise((resolve, reject) => {
        mySqlConnection.getConnection().commit(error => {
            if (error) return reject(error);
            resolve();
        });
    });
};

/**
 * This function will rollback the transaction
 */
async function rollback() {
    await new Promise((resolve, reject) => {
        mySqlConnection.getConnection().rollback(error => {
            if (error) return reject(error);
            resolve();
        });
    });
};
