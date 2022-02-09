const express = require('express');
const sha256 = require('sha256');

const dbConnection = require('../services/DatabaseService');
const loggingService = require('../services/LoggingService');

const { SECRET_KEY, MAX_SESSIONS, MAX_SESSION_DURATION } = require('../local');

const router = express.Router();

router.post('/register/1', async (req, res) => {
    try {
        if (req.body?.mobile == null || req.body?.name == null) {
            return res.send(400, {
                error: 'Required Attribute Not Found',
                message: 'Missing mobile or name of the user',
            });
        }

        const { mobile, name } = req.body;

        if (doesFieldExistForUser('mobile', mobile)) {
            return res.send(400, {
                error: 'Re-registration Attempt',
                message: 'Mobile number already exists in the database',
            });
        }

        req.session = {
            ...req.session,
            isLoggedIn: false,
            name,
            mobile
        };

        res.send(200, { message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/1'
        });
        res.send(500, 'Internal Server Error');
    }
});

router.post('/register/2', async (req, res) => {
    try {
        if (req.body?.email == null || req.body?.password == null) {
            return res.send(400, {
                error: 'Required Attribute Not Found',
                message: 'Missing email or password',
            });
        }

        const { email, password } = req.body;

        if (doesFieldExistForUser('email', email)) {
            return res.send(400, {
                error: 'Re-registration Attempt',
                message: 'Email id already exists in the database',
            });
        }

        const hashedPassowrd = sha256.x2(password + SECRET_KEY);

        req.session = {
            ...req.session,
            email,
            password: hashedPassowrd,
        };

        res.send(200, { message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/2'
        });
        res.send(500, 'Internal Server Error');
    }
});

router.post('/register/3', async (req, res) => {
    try {
        if (
            req.body?.pan == null ||
            req.body?.fathersName == null ||
            req.body?.dob == null
        ) {
            return res.send(400, {
                error: 'Required Attribute Not Found',
                message: 'Missing pan, date of birth or fathers name',
            });
        }

        const { pan, fathersName, dob } = req.body;

        if (new Date(dob).toString() === 'Invalid Date') {
            return res.send(400, {
                error: 'Invalid Attribute value',
                message: 'The value of date is not valid',
            });
        }

        if (new Date(dob).getTime() > new Date().getTime()) {
            return res.send(400, {
                error: 'Invalid Attribute value',
                message: 'Date of birth has to be before today',
            });
        }

        const { email, password, name, mobile } = req.session;

        const CREATE_NEW_USER = 'INSERT INTO user_details (`mobile`, `name`, `hashed_password`, `email`, `pan`, `fathers_name`, `dob`) VALUES ?';

        await dbConnection.queryDatabase(CREATE_NEW_USER, [
            [mobile, name, password, email, pan, fathersName, dob]
        ]);

        req.session.isLoggedIn = true;
        res.send(201, { message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/3'
        });
        res.send(500, 'Internal Server Error');
    }
});

router.post('/logout', async (req, res) => {
    try {
        const LOG_USER_OUT = 'UPDATE `user_sessions` SET `is_session_active` = 0';
        await dbConnection.queryDatabase(LOG_USER_OUT, [req.session.sessionId]);

        res.send(200, 'OK')
        delete req.session;
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/logout'
        });
        res.send(500, 'Internal Server Error');
    }
});

router.post('/login', async (req, res) => {
    try {
        if (req.body?.email == null || req.body?.password == null) {
            return res.send(400, {
                error: 'Required Attribute Not Found',
                message: 'Missing email or password',
            });
        }

        const { email, password } = req.body;

        if (!await areUserCredentialsValid(email, password)) {
            return res.send(400, {
                error: 'Invalid login attempt',
                message: 'Invalid email or password entered',
            });
        }

        const userId = userDetails[0].id;

        if (hasUserReachedMaxSessions(userId)) {
            return res.send(400, {
                error: 'Invalid login attempt',
                message: 'Maximum active sessions limit reached',
            });
        }

        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + MAX_SESSION_DURATION);

        const LOG_USER_IN = 'INSERT INTO user_sessions (`user_id`,`session_expiry_date`) VALUES ?';
        const sessionInfo = await dbConnection.queryDatabase(LOG_USER_IN, [
            [userId, sessionExpiry]
        ]);

        res.send(200, 'OK');

        req.session = {
            ...req.session,
            isLoggedIn: true,
            sessionId: sessionInfo.insertId,
            userId,
        };
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/login'
        });
        res.send(500, 'Internal Server Error');
    }
});

module.exports = router;

async function doesFieldExistForUser(field, value) {
    const GET_USER_COUNT = 'SELECT COUNT(`' + field + '`) AS `count` FROM `user_details` WHERE `' + field + '` = ?';
    const countData = await dbConnection.queryDatabase(GET_USER_COUNT, [value]);

    return countData.count == 1;
}

async function areUserCredentialsValid(email, password) {
    const hashedPassowrd = sha256.x2(password + SECRET_KEY);

    const VALIDATE_USER_DETAILS = 'SELECT `id` FROM `user_details` WHERE `email` = ? AND `hashed_password` = ?';
    const userDetails = await dbConnection.queryDatabase(VALIDATE_USER_DETAILS, [email, hashedPassowrd]);

    return userDetails.length !== 0;
}

async function hasUserReachedMaxSessions(userId) {
    const VALIDATE_USER_SESSIONS = 'SELECT `id` FROM `user_sessions` WHERE `is_session_active` = 1 AND `user_id` = ? and session_expiry_date > CURRENT_TIMESTAMP';
    const userSessionsInfo = await dbConnection.queryDatabase(VALIDATE_USER_SESSIONS, [userId]);

    return userSessionsInfo.length > MAX_SESSIONS;
}
