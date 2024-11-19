// import
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const methodOverride = require("method-override")
const morgan = require("morgan")

const port = process.env.PORT ? process.env.PORT : "3000" // set port to env variable or defaualt to 3000
const authController = require("./controllers/auth.js")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const isLoggedIn = require("./middleware/is-logged-in.js")
const isAdmin = require("./middleware/is-admin.js")
const passUserToView = require("./middleware/pass-user-to-view.js")

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
app.use( // integrate session management
    session({
        secret: process.env.SESSION_SECRET, // secret key
        resave: false, // not to resave sessions that haven't changed
        saveUninitialized: true, // allow for storing new, unitialized sessions
        store: MongoStore.create({ // save sessions in MongoDB
            mongoUrl: process.env.MONGODB_URI
        })
    })
)
app.use(passUserToView) // passes user info to all templates

// forum routes
// GET /    //landing page
app.get("/", async (req, res) => {
    res.render("index.ejs");
})

app.use("/auth", authController)

// GET /forums
app.get("/forums", isLoggedIn, async (req, res) => {
    const allForums = await Forum.find()
    res.render("forums/index.ejs", { forums: allForums })
})

// GET /forums/new
app.get("/forums/new", isAdmin, (req, res) => {
    res.render("forums/new.ejs")
})

// POST /forums
app.post("/forums", async (req, res) => {
    // case-insensitive check if forum topic already exists using reg ex
    const fieldInDatabase = await Forum.findOne({ 
        field: { $regex: new RegExp(`^${req.body.field}$`, 'i') } 
    })
    if (fieldInDatabase) {
        return res.send("Forum already exists.")
    }

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
app.get("/forums/:forumId/edit", isAdmin, async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    res.render("forums/edit.ejs", { forum: foundForum })
})

// PUT /forums/:forumId
app.put("/forums/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    await Forum.findByIdAndUpdate(req.params.forumId, req.body)
    res.redirect(`/forums/${req.params.forumId}`)
})

// prediction routes


// listen
app.listen(3000, () => {
    console.log(`Listening on port ${port}`)
})