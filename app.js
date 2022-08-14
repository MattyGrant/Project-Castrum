if (process.env.NODE_ENV !== 'production') { //Production mode variable
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

// passport config
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/userAuth');


// routes
const userRoutes = require('./routes/authRoutes');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

// Shorten the code for connection with db var
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Woo! You're in!");
    
});
const app = express();

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Uses
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'this is our secret....for now ;)',
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //Default is true 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Week from date
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //Persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// router handlers
app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('home')
});

// Every path call for ExpressError
app.all('*', (req, res, next) =>{
    next(new ExpressError('Page not found', 404));
})
// Error Handling with template
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No! Something went wrong!'
    res.status(statusCode).render('error', { err });
});
// Port
app.listen(3000, () => {
    console.log('listening on port 3000')
});
