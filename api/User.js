const express = require("express");
const router = express.Router();

const User = require("./../models/user");
const bcrypt = require("bcrypt");

//env variables
require("dotenv").config();

// ------------------------ Signup Route ------------------------
router.post('/signup', async (req, res) => {
    let { name, email, password } = req.body;
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
        return res.json({
            status: "Failed",
            message: "Invalid Input"
    });
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        return res.json({
            status: "Failed",
            message: "Invalid Name"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.json({
            status: "Failed",
            message: "Invalid Email"
        });
    } else if (password.length < 8) {
        return res.json({
            status: "Failed",
            message: "Password must be at least 8 characters"
        });
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                return res.json({
                    status: "Failed",
                    message: "Email Address Already Exists"
                });
            } else {
                // Create user
                const saltRound = 10;
                bcrypt.hash(password, saltRound).then(hashedPass => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPass,
                        verified: true
                    });

                    newUser.save().then(result => {
                        res.redirect('/login');
                    }).catch(err => {
                        console.log(`Error saving user: ${err}`);
                        return res.json({
                            status: "Failed",
                            message: "An error occurred while saving user"
                        });
                    });
                }).catch(err => {
                    console.log(`Error hashing password: ${err}`);
                    return res.json({
                        status: "Failed",
                        message: "An error occurred while hashing password"
                    });
                });
            }
        }).catch(err => {
            console.log(`Error checking existing user: ${err}`);
            return res.json({
                status: "Failed",
                message: "An error occurred while checking user"
            });
        });
    }
});

// ------------------------ Signin Route ------------------------
router.post('/signin', async (req, res) => {
    let { email, password } = req.body;
    email = email?.trim() || "";
    password = password?.trim() || "";

    if (email === "" || password === "") {
        return res.json({
            status: "Failed",
            message: "All the fields are empty"
        });
    }

    User.find({ email })
        .then(data => {
            if (data.length > 0) {
                const hashedPass = data[0].password;

                bcrypt.compare(password, hashedPass)
                    .then(result => {
                        if (result) {
                            // Save session
                            req.session.user = {
                                name: data[0].name,
                                email: data[0].email
                            };

                            console.log("Logged in successfully....!");
                            return res.redirect('/');
                        } else {
                            return res.json({
                                status: "Failed",
                                message: "Invalid password"
                            });
                        }
                    })
                    .catch(err => {
                        console.log(`Error comparing passwords: ${err}`);
                        return res.json({
                            status: "Failed",
                            message: "An error occurred while comparing password"
                        });
                    });
            } else {
                return res.json({
                    status: "Failed",
                    message: "User not found"
                });
            }
        })
        .catch(err => {
            console.log(`Error finding user: ${err}`);
            return res.json({
                status: "Failed",
                message: "An error occurred while finding user"
            });
        });
});

module.exports = router;
