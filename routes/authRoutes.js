const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userAuth');
const passport = require('passport');
const authController = require('../controllers/Authorizations');

// Register auth Express Route chain
router.route('/register')
    .get(// Register form index
        authController.registerFormIndex)
    .post(// Registration
        catchAsync(authController.register))

// Login auth Express Route chain 
router.route('/login')
    .get(// Login form index
        authController.loginFormIndex)
    .post(// Login 
        passport.authenticate(
            'local', 
            { 
                failureFlash: true, 
                failureRedirect: '/login', 
                keepSessionInfo: true 
            }), 
            authController.login)


// Logout
router.get(
    '/logout', 
    authController.logout)

module.exports = router;