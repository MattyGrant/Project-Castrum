const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

// Shorten the code for connection with db var
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Woo! You're in!");
    
});
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

// Uses
app.engine('ejs',ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Campground CRUD routers
app.use('/campgrounds', campgrounds)
// Review routers
app.use('/campgrounds/:id/reviews', reviews);

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
