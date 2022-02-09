module.exports = {
    enviroment: 'development',
    port: 3000,

    SECRET_KEY: 'mY_$eCrEt_kEy',
    MAX_SESSIONS: 3,
    MAX_SESSION_DURATION: 1, // Hour(s)

    mysql: {
        credentials: {
            user: 'root',
            password: 'root',
        },
        databaseName: 'userLoginApplication',
        host: 'localhost',
    },
    SESSION_SECRET: 'Ssdsd@#e$#Rfe@#$d#$#',
};
