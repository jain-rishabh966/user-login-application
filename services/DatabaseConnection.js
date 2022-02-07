/**
 * This class is used to get instance of the connection with MySQL Database
 */
class SingletonMySQLConnection {
    constructor() {
        throw new Error('Use DatabaseConnection.getConnection()');
    }

    static getConnection() {
        if (!SingletonMySQLConnection.instance) {
            const mysql = require('mysql');

            const {
                mysql: { credentials, databaseName, host }
            } = require('../local');

            const connection = mysql.createConnection({
                host,
                user: credentials.user,
                password: credentials.password,
                database: databaseName,
            });

            connection.connect(err => {
                if (err) throw err;
                console.log('Successfully connected to MySQL...');
            });

            SingletonMySQLConnection.instance = connection;
        }

        return SingletonMySQLConnection.instance;
    }
}

module.exports = {
    mySqlConnection: SingletonMySQLConnection
};
