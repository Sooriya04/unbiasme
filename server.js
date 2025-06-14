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

// Static folder (if needed for CSS or JS)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const userRouter = require('./api/User');
const quizRouter = require('./api/quiz');

// using routes
app.use('/user', userRouter);
app.use('/quiz', quizRouter);

// render home page
app.get('/', (req, res) => {
    if (req.session.user) {
        res.render('home', { name: req.session.user.name });
    } else {
        res.redirect('/login');
    }
});

// render login page
app.get('/login', (req, res) => res.render('login'));

// render signup page
app.get('/signup', (req, res) => res.render('signup'));

// logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// render quiz page
app.get('/quiz', (req, res) => {res.render('quiz');});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
