require('dotenv').config();        
require('./config/db');          
const express = require('express');
const session = require('express-session');
const path = require('path');

const app  = express();
const port = process.env.PORT || 3000;

/* -----------------------  middlewares  ----------------------- */
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

app.use((req, res, next) => {
  res.locals.name = req.session.user?.name;  
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

/* -----------------------  routes  ----------------------- */
const userRouter     = require('./api/User');      
const questionsRouter= require('./api/questions');

app.use('/user', userRouter);
app.use('/quiz', questionsRouter);

/* -------------  page routing --------------- */

// Home
app.get('/', (req, res) => {
    res.render('pages/home');        
});


app.get('/login',  (req, res) => res.render('pages/login'));
app.get('/signup', (req, res) => res.render('pages/signup'));

//content
app.get('/how-the-unbiasme-quiz-works', (req, res) => res.render('content/unbiase'));
app.get('/what-are-cognitive-biases', (req, res) => res.render('content/bias'));
app.get('/how-are-personality-and-bias-linked', (req, res) => res.render('content/link'));
app.get('/what-are-personality-traits', (req, res) => res.render('content/traits'));

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
