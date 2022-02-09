const express = require('express');

const { port } = require('./local');
const loggingService = require('./services/LoggingService');

const app = express();

// Setting up view engine as ejs
app.set('view engine', 'ejs');

// Setting up middleware
app.use(express.static('public'));
app.use(logger);
app.use(express.json());

// Setting up routes
app.use('/users', require('./routes/users'));

// Startig the server on the specified port
app.listen(port, err => {
    if (err) {
        loggingService.errorLog(err);
    } else {
        console.info(`Listening at port ${port}`);
    }
});

function logger(req, res, next) {
    console.info(req.method, ' ', req.originalUrl);
    next();
};
