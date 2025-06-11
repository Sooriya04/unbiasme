require('./config/db');
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const port = 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routers
const userRouter = require('./api/User');
app.use('/user', userRouter);

// Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        res.render('home', { name: req.session.user.name });
    } else {
        res.redirect('/login');
    }
});

app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
