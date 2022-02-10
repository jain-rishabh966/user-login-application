const express = require('express');
const sha256 = require('sha256');

const dbConnection = require('../services/DatabaseService');
const loggingService = require('../services/LoggingService');

const { SECRET_KEY, MAX_SESSIONS, MAX_SESSION_DURATION } = require('../local');

const router = express.Router();

/**
 * This function is used to add name and mobile to the session which can be saved later once the request completes
 */
router.post('/register/1', async (req, res) => {
    try {
        // Validation for missing params
        if (req.body?.mobile == null || req.body?.name == null) {
            return res.status(400).send({
                error: 'Required Attribute Not Found',
                message: 'Missing mobile or name of the user',
            });
        }

        const { mobile, name } = req.body;

        // Filter for illegal mobile number
        if (!/^[0-9]{8,10}$/.test(mobile)) {
            return res.status(400).send({
                error: 'Invalid Value Provided',
                message: 'Mobile number should only contain digits',
            });
        }

        // Filter for already existing mobile no
        if (await doesFieldExistForUser('mobile', mobile)) {
            return res.status(400).send({
                error: 'Re-registration Attempt',
                message: 'Mobile number already exists in the database',
            });
        }

        // Set values in session for the user
        req.session.isLoggedIn = false;
        req.session.name = name;
        req.session.mobile = mobile;

        res.status(200).send({ message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/1'
        });
        res.status(500).send('Internal Server Error');
    }
});

/**
 * This function is used to add email and hashed password (hashed using sha256) to the session which can be saved later once the request completes.
 * Assumption: Plain password can be supplied securely over https connection
 */
router.post('/register/2', async (req, res) => {
    try {
        // Validation for missing params
        if (req.body?.email == null || req.body?.password == null) {
            return res.status(400).send({
                error: 'Required Attribute Not Found',
                message: 'Missing email or password',
            });
        }

        const { email, password } = req.body;

        // Filter for illegal email
        if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
            return res.status(400).send({
                error: 'Invalid Value Provided',
                message: 'Email is invalid',
            });
        }

        // Filter for already existing email ids
        if (await doesFieldExistForUser('email', email)) {
            return res.status(400).send({
                error: 'Re-registration Attempt',
                message: 'Email id already exists in the database',
            });
        }

        // Hashing password with SHA256 algorithm twice
        const hashedPassowrd = sha256.x2(password + SECRET_KEY);

        // Saving values in session
        req.session.email = email;
        req.session.password = hashedPassowrd;

        res.status(200).send({ message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/2'
        });
        res.status(500).send('Internal Server Error');
    }
});

/**
 * This function is used to add dob, pan and fathers name to the database
 * along with the rest of the values in the session.
 */
router.post('/register/3', async (req, res) => {
    try {
        // Validation for missing params
        if (
            req.body?.pan == null ||
            req.body?.fathersName == null ||
            req.body?.dob == null
        ) {
            return res.status(400).send({
                error: 'Required Attribute Not Found',
                message: 'Missing pan, date of birth or fathers name',
            });
        }

        const { pan, fathersName, dob } = req.body;

        // Checking for a valid date
        if (new Date(dob).toString() === 'Invalid Date') {
            return res.status(400).send({
                error: 'Invalid Attribute value',
                message: 'The value of date is not valid',
            });
        }

        if (new Date(dob).getTime() > new Date().getTime()) {
            return res.status(400).send({
                error: 'Invalid Attribute value',
                message: 'Date of birth has to be before today',
            });
        }

        const { email, password, name, mobile } = req.session;

        // Creating a new entry for the user in the user_details table
        const CREATE_NEW_USER = 'INSERT INTO user_details (`mobile`, `name`, `hashed_password`, `email`, `pan`, `fathers_name`, `dob`) VALUES (?, ?, ?, ?, ?, ?, ?)';

        await dbConnection.queryDatabase(CREATE_NEW_USER,
            [mobile, name, password, email, pan, fathersName, dob]
        );

        res.status(201).send({ message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/register/3'
        });
        res.status(500).send('Internal Server Error');
    }
});

/**
 * This function is used to log the user out in case he is logged in
 */
router.post('/logout', async (req, res) => {
    try {
        const LOG_USER_OUT = 'UPDATE `user_sessions` SET `is_session_active` = 0 WHERE id = ?';
        await dbConnection.queryDatabase(LOG_USER_OUT, [req.session?.sessionId || 0]);

        res.status(200).send({ message: 'OK' });

        req.session.isLoggedIn = false;
        delete req.session.sessionId;
        delete req.session.userId;
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/logout'
        });
        res.status(500).send('Internal Server Error');
    }
});

/**
 * This function is used to make a new session for the user on login
 */
router.get('/login', async (req, res) => {
    try {
        // Validation for missing params
        if (req.body?.email == null || req.body?.password == null) {
            return res.status(400).send({
                error: 'Required Attribute Not Found',
                message: 'Missing email or password',
            });
        }

        const { email, password } = req.body;

        // Validate credentials
        const { status: validCredentials, userId } = await areUserCredentialsValid(email, password);
        if (!validCredentials) {
            return res.status(400).send({
                error: 'Invalid login attempt',
                message: 'Invalid email or password entered',
            });
        }

        // Validate the number of active user sessions
        if (await hasUserReachedMaxSessions(userId)) {
            return res.status(400).send({
                error: 'Invalid login attempt',
                message: 'Maximum active sessions limit reached',
            });
        }

        // Setting a session expiry time
        const sessionExpiry = new Date();
        sessionExpiry.setHours(sessionExpiry.getHours() + MAX_SESSION_DURATION);

        // Logging in user by creating a new session
        const LOG_USER_IN = 'INSERT INTO user_sessions (`user_id`,`session_expiry_date`) VALUES (?, ?)';
        const sessionInfo = await dbConnection.queryDatabase(LOG_USER_IN,
            [userId, sessionExpiry]
        );

        // Setting up the session variables
        req.session.isLoggedIn = true;
        req.session.sessionId = sessionInfo.insertId;
        req.session.userId = userId;

        res.status(200).send({ message: 'OK' });
    } catch (error) {
        loggingService.errorLog(error, {
            resource: '/login'
        });
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

/**
 * This function is used to check a field in database
 * 
 * @param {String} field Field name in the database for the table user_details
 * @param {*} value Any value of the field that will be validated
 * @returns true if the field exists and false if it doesnt
 */
async function doesFieldExistForUser(field, value) {
    const GET_USER_COUNT = 'SELECT COUNT(`' + field + '`) AS `count` FROM `user_details` WHERE `' + field + '` = ?';
    const countData = await dbConnection.queryDatabase(GET_USER_COUNT, [value]);

    return countData[0].count == 1;
}

/**
 * This function validates the user login details
 * 
 * @param {String} email Email of the user
 * @param {String} password Password of the user (Plain string)
 * @returns user id of the user if the details are valid
 */
async function areUserCredentialsValid(email, password) {
    const hashedPassowrd = sha256.x2(password + SECRET_KEY);

    const VALIDATE_USER_DETAILS = 'SELECT `id` FROM `user_details` WHERE `email` = ? AND `hashed_password` = ?';
    const userDetails = await dbConnection.queryDatabase(VALIDATE_USER_DETAILS, [email, hashedPassowrd]);

    return { status: userDetails.length !== 0, userId: userDetails[0]?.id };
}

/**
 * This function is used to validate sessions
 *
 * @param {*} userId userId of the user
 * @returns true if the user has reached the session limit and false if not the case
 */
async function hasUserReachedMaxSessions(userId) {
    const VALIDATE_USER_SESSIONS = 'SELECT `id` FROM `user_sessions` WHERE `is_session_active` = 1 AND `user_id` = ? and session_expiry_date > CURRENT_TIMESTAMP';
    const userSessionsInfo = await dbConnection.queryDatabase(VALIDATE_USER_SESSIONS, [userId]);

    return userSessionsInfo.length >= MAX_SESSIONS;
}
