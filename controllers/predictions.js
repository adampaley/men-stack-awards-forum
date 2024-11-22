// imports
const express = require('express')
const router = express.Router()
const Prediction = require('../models/prediction.js')
const isLoggedIn = require("../middleware/is-logged-in.js")
const User = require('../models/user.js')

// routes
// GET /predictions/new
router.get("/new", async (req, res) => {
    res.render("predictions/new.ejs")
})

// POST /predictions
router.post("/", async (req, res) => {
    const rank = parseInt(req.body.rank)
    let pointsScored = 0

    if (rank) {
        pointsScored = 6 - rank
    }

    req.body.points = pointsScored

    await Prediction.create(req.body)
    res.redirect("/predictions")
})

// exports
module.exports = router
