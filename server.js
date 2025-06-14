// server.js
require('./config/db');
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static folder (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRouter = require('./api/User');
const quizRouter = require('./api/quiz');

app.use('/user', userRouter);
app.use('/quiz', quizRouter);

// Home route
app.get('/', (req, res) => {
    if (req.session.user) {
        res.render('pages/home', { name: req.session.user.name });
    } else {
        res.redirect('/login');
    }
});

// Login page
app.get('/login', (req, res) => res.render('pages/login'));

// Signup page
app.get('/signup', (req, res) => res.render('pages/signup'));

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Quiz page
app.get('/quiz', (req, res) => {
    res.render('pages/quiz');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});