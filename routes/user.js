const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const passport = require('passport');
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let error = [];
    if (!name || !email || !password || !password2) {
        error.push({ msg: 'Fill all the candentials avilable' });
    }
    if (password !== password2) {
        error.push({ msg: 'Enter same password in both' });
    }
    if (password.length < 6) {
        error.push({ msg: 'Password must contain atleast 6 characters' });
    }
    if (error.length > 0) {
        res.render('register', {
            error,
            name,
            email,
            password,
            password2
        });
    } else {
        // Validation Pass
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User exists
                    error.push({ msg: 'Email is already registered' });
                    res.render('register', {
                        error,
                        name,
                        email,
                        password,
                        password2
                    });
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    });

                    // Hash Password

                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        // Set password to hashed 
                        newUser.password = hash;
                        // Save user
                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now regestered and can login');
                                res.redirect('/user/login');
                            })
                            .catch(err => console.log(err));
                    }))
                }
            });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out.');
    res.redirect('/user/login');
})

module.exports = router;