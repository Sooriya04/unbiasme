// server.js
require('dotenv').config();        // Load .env variables (e.g., GEMINI_API_KEY)
require('./config/db');            // MongoDB connection

const express  = require('express');
const session  = require('express-session');
const path     = require('path');

const app  = express();
const port = process.env.PORT || 3000;

/* -----------------------  MIDDLEWARES  ----------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

// Make session name available to every EJS view
app.use((req, res, next) => {
  res.locals.name = req.session.user?.name;   // <%= name %> in EJS
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

/* -----------------------  ROUTES  ----------------------- */
const userRouter     = require('./api/User');       // Auth, signup, login
const questionsRouter= require('./api/questions');  // Quiz questions


app.use('/user', userRouter);
app.use('/quiz', questionsRouter);

/* -------------  PAGE ROUTES --------------- */

// Home
app.get('/', (req, res) => {
    res.render('pages/home');        
});


app.get('/login',  (req, res) => res.render('pages/login'));
app.get('/signup', (req, res) => res.render('pages/signup'));

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Quiz page 
app.get('/quiz', (req, res) => {
  if (req.session.user) {
    res.render('pages/quiz');
  } else {
    res.redirect('/login');
  }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    res.render('pages/dashboard');
  } else {
    res.redirect('/login');
  }
});

// 404 page
app.use((req, res) => res.status(404).send('404 Not Found'));

// Starting 
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
