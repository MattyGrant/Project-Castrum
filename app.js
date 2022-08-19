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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

// passport config
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/userAuth');


// routes
const userRoutes = require('./routes/authRoutes');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'; //

mongoose.connect(dbUrl, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

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
app.use(mongoSanitize({ replaceWith: '_', }));

const secret = process.env.SECRET || 'this is our secret...for now ;)'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

// store.on('error', funciton (e) {
//     console.log("Session Store Error", e)
// })

const sessionConfig = {
    store,
    name: '_MGG',
    secret,
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //Default is true
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //Week from date
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet()); //Breaks code and styling when uncommented

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/mrmatty/",
    "/views/campgrounds/index.ejs",
    "/views/campgrounds/show.ejs"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/mrmatty/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/mrmatty/",
    "https://ka-f.fontawesome.com/releases/v6.1.2/css/free.min.css",
    "https://ka-f.fontawesome.com/releases/v6.1.2/css/free-v4-shims.min.css",
    "https://ka-f.fontawesome.com/releases/v6.1.2/css/free-v5-font-face.min.css",
    "https://ka-f.fontawesome.com/releases/v6.1.2/css/free-v4-font-face.min.css"
];
const fontSrcUrls = [ 
    "https://res.cloudinary.com/mrmatty/",
    "https://ka-f.fontawesome.com/releases/v6.1.2/webfonts/free-fa-solid-900.woff2",
    "https://ka-f.fontawesome.com/releases/v6.1.2/webfonts/free-fa-solid-900.ttf",
 ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : ["'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls,],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/mrmatty/",
                "https://images.unsplash.com/",
                "https://s3.us-west-2.amazonaws.com/images.unsplash.com/application-1660794498753-9d8f05607969image",
                "https://s3.us-west-2.amazonaws.com/images.unsplash.com/application-1660802388004-1ea97ac82acfimage",
                "https://s3.us-west-2.amazonaws.com/images.unsplash.com/application-1660804642258-80856c540caeimage",
                "https://s3.us-west-2.amazonaws.com/images.unsplash.com/application-1660872491404-9783037e98b3image"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
        }
    })
);

app.use(passport.initialize());
app.use(passport.session()); //Persistent login sessions
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
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
const port = process.env.PORT || 3000 
app.listen(port, () => {//heroku port default
    console.log(`Listening on port ${port}`)
});
