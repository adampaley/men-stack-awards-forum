// require
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const methodOverride = require("method-override")
const morgan = require("morgan")

const port = process.env.PORT ? process.env.PORT : "3000" // set port to env variable or defaualt to 3000

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`) // log connection
})

// imports
const Forum = require("./models/forum.js")

// middleware
app.use(express.urlencoded({ extended: false})) // parse URL-encoded data from forms
app.use(methodOverride("_method")) // use HTTP verbs such as PUT or DELETE
app.use(morgan('dev')) // logging HTTP requests

// routes
// GET /    //landing page
app.get("/", async (req, res) => {
    res.render("index.ejs")
})

// GET /forums
app.get("/forums", async (req, res) => {
    const allForums = await Forum.find()
    res.render("forums/index.ejs", { forums: allForums})
})

// GET /forums/new
app.get("/forums/new", (req, res) => {
    res.render("forums/new.ejs")
})

// POST /forums
app.post("/forums", async (req, res) => {
    await Forum.create(req.body)
    res.redirect("forums")
})

// GET /forums/:forumId
app.get("/forums/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    res.render("forums/show.ejs", { forum: foundForum })
})

// DELETE /forums/:forumId
app.delete("/forums/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    await Forum.findByIdAndDelete(req.params.forumId)
    res.redirect("/forums")
})

// GET /forums/:forumId/edit
app.get("/forums/:forumId/edit", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    res.render("forums/edit.ejs", {
        forum: foundForum,
    })
})

// PUT /forums/:forumId
app.put("/forums/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    await Forum.findByIdAndUpdate(req.params.forumId, req.body)
    res.redirect(`/forums/${req.params.forumId}`)
})

// listen
app.listen(3000, () => {
    console.log(`Listening on port ${port}`)
})