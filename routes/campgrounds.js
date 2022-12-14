const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campController = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });


// Campground Root Express Route Chain
router.route('/')
    .get(
        catchAsync(campController.campgroundIndex)) // Campground's index
    .post( //campground creation
        isLoggedIn, 
        upload.array('images'),
        validateCampground, 
        catchAsync(campController.createCampground)
        ); 
// New Campground Form
router.get(
    '/new', 
    isLoggedIn, 
    campController.renderNewForm
    )

//Campground Id Express Route Chain
router.route('/:id')
    .get(  // campground show page
        catchAsync(campController.showPage))
    .put(// campground update changes
        isLoggedIn, 
        upload.array('images'),
        validateCampground, 
        isAuthor, 
        catchAsync(campController.updateCampgrounds))
    .delete( // campground deletion
        isLoggedIn, 
        isAuthor, 
        catchAsync(campController.deleteCampgrounds))

// campground editing
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campController.editCampgrounds))

module.exports = router;
