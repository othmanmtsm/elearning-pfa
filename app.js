const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cros = require('cors');
const passport = require('passport');
const authRouter = require('./routes/auth');
const studentRouter = require('./routes/student');

const app = express();
app.use(helmet());
require('dotenv').config();
require('./config/passport')(passport);//passport model

app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cros());
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/auth', authRouter);
app.use('/student', studentRouter);

module.exports = app;