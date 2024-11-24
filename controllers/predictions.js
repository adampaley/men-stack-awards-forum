// imports
// const express = require('express')
// const router = express.Router()
// const Prediction = require('../models/prediction.js')
// const isLoggedIn = require("../middleware/is-logged-in.js")
// const User = require('../models/user.js')
// const categories = require("../data/categories2024.js")


// routes
// GET /predictions/new
// router.get("/new", async (req, res) => {
//     res.render("predictions/new.ejs")
// })

// POST /predictions
// router.post("/", async (req, res) => {
//     const rank = parseInt(req.body.rank)
//     let pointsScored = 0

//     if (rank) {
//         pointsScored = 6 - rank
//     }

//     req.body.points = pointsScored

//     await Prediction.create(req.body)
//     res.redirect("/predictions")
// })

// // GET /predictions/new
// app.get("/predictions/new", async (req, res) => {
//     res.render("predictions/new.ejs")
// })

// // POST /predictions
// app.post("/predictions", async (req, res) => {
//     const rank = parseInt(req.body.rank)
//     let pointsScored = 0

//     if (rank) {
//         pointsScored = 6 - rank
//     }

//     req.body.points = pointsScored

//     await Prediction.create(req.body)
//     res.redirect("/predictions")
// })

// // predictions 
// // GET /predictions
// app.get("/predictions", async (req, res) => {
//     const predictions = await Prediction.find()
//     const contenderPoints = {}

//     // aggregate points
//     predictions.forEach(prediction => {
//         prediction.contenders.forEach((contender) => {
//             contenderPoints[contender.name] = (contenderPoints[contender.name] || 0) + contender.points
//         })
//     })

//     // sort in descending order
//     const sortedContenders = Object.entries(contenderPoints).map(([name, points]) => ({name, points})).sort((a,b) => contenderPoints[b] - contenderPoints[a])

//     res.render("predictions/index.ejs", { predictions, sortedContenders})
// })

// // GET /predictions/new
// app.get("/predictions/new", isLoggedIn, async (req, res) => {
//     const user = await User.findById(req.session.user._id)
//     res.render("predictions/new.ejs", { categories, user })
// })

// // POST /predictions
// app.post("/predictions", isLoggedIn, async (req, res) => {
//     const userId = req.session.user._id
//     const category = "Best Picture"

//     // create prediction
//     await Prediction.create({category, user: userId})

//     res.redirect("predictions")
// })


// exports
// module.exports = router
