// imports
const express = require("express")
const router = express.Router()
const User = require("../models/user.js")
const bcrypt = require("bcrypt")

// routes
// GET /register
router.get("/register", (req, res) => {
    const pageTitle = "Register - "
    res.render("auth/register.ejs", { pageTitle })
})

// POST /register 
router.post("/register", async (req, res) => {
    // unique username
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
        return res.send("Username already taken")
    }

    // no other account
    const emailInDatabase = await User.findOne({ email: req.body.email })
    if (emailInDatabase) {
        return res.send("Email already used")
    }

    // password match
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("Password and Confirm Password must match")
    }
    // encryption
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword

    // create user
    const user = await User.create(req.body)

    // start session
    req.session.user = {
      username: user.username,
      _id: user._id,
      isAdmin: user.isAdmin
    }
      
    // asynchronous pattern
    req.session.save(() => {
      res.redirect("/")
    })
})

// GET /log-in
router.get("/log-in", (req, res) => {
    const pageTitle = "Log In - "
    res.render("auth/log-in.ejs", { pageTitle })
})

// POST /log-in
router.post("/log-in", async (req, res) => {
    // confirm it is a user
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
        return res.send("Login failed. Please try again.")
    }
    // test password with bcrypt
    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    )
    if (!validPassword) {
        return res.send("Login failed. Please try again.")
    }
    // session data
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
        isAdmin: userInDatabase.isAdmin
    }
    
    // asynchronous pattern
    req.session.save(() => {
        // redirect to URL in is-logged-in or to landing page
        const redirectTo = req.session.returnTo || "/"
        delete req.session.returnTo
        res.redirect(redirectTo)
    })
})

// GET /logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => { 
      res.redirect("/")
    })
})

// exports
module.exports = router