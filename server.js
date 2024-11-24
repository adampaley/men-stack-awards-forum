// import
require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const app = express()
const methodOverride = require("method-override")
const morgan = require("morgan")
const port = process.env.PORT ? process.env.PORT : "3000" // set port to env variable or default to 3000
const authController = require("./controllers/auth.js")
const forumController = require("./controllers/forums.js")
// const predictionController = require("./controllers/predictions.js")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const isLoggedIn = require("./middleware/is-logged-in.js")
const isAdmin = require("./middleware/is-admin.js")
const passUserToView = require("./middleware/pass-user-to-view.js")
// const returnToUrl = require("./middleware/return-to-url.js")

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name}`) // log connection
})

// imports
const User = require('./models/user.js')
const { Forum, Topic, Post  } = require("./models/forum.js")
const Prediction = require("./models/prediction.js")

// middleware
app.use(express.static('public')) // access CSS, Assets
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
// app.use(returnToUrl) // sends user back to page where they selected an auth route


// landing page
// GET /
app.get("/", async (req, res) => {
    const pageTitle = ""
    res.render("index.ejs", { pageTitle }) //{ predictions, contenderPoints}
})

// controllers
app.use("/auth", authController)
app.use("/forums", forumController)
// app.use("/predictions", predictionController)

// listen
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})