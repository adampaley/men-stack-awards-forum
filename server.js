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
const User = require('./models/user.js')
const { Forum, Topic, Post  } = require("./models/forum.js")

// const Prediction = require("./models/prediction.js")
// const categories = require("./data/categories2024.js")

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


// landing page
// GET /
app.get("/", async (req, res) => {
    // // once Best Picture is started, change this to findById
    // const predictions = await Prediction.find()
    // const contenderPoints = {}

    // // aggregate points
    // predictions.forEach(prediction => {
    //     prediction.contenders.forEach(contender => {
    //         contenderPoints[contender.name] = (contenderPoints[contender.name] || 0) + contender.points
    //     })
    // })

    // // sort in descending order
    // const sortedContenders = Object.keys(contenderPoints).sort((a,b) => contenderPoints[b] - contenderPoints[a])

    res.render("index.ejs") //{ predictions, contenderPoints}
})

// controllers
app.use("/auth", authController)

// forums // consider moving to a controller

// GET /forums
app.get("/forums", async (req, res) => {
    const allForums = await Forum.find()
    res.render("forums/index.ejs", { forums: allForums })
})

// GET /forums/new
app.get("/forums/new", isAdmin, (req, res) => {
    res.render("forums/new.ejs")
})

// POST /forums
app.post("/forums", async (req, res) => {
    if (!req.body.field) {
        return res.send("Forum field needs text")
    }
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

// GET /forums/:forumId // also index route for Topics
app.get("/forums/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    res.render("forums/show.ejs", { forum: foundForum, topics: foundForum.topics })
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

// topics
// GET /forums/:forumId/new
app.get("/forums/:forumId/new", isLoggedIn, async (req, res) => {
    const forum = req.params.forumId
    const currentUser = await User.findById(req.session.user._id)
    username = currentUser.username
    res.render("topics/new.ejs", { forum, username })
})


// POST /forums/:forumsId
app.post("/forums/:forumId", isLoggedIn, async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)

        // case-insensitive check if forum topic already exists using reg ex
        const newTopicTitle = req.body.title.trim()
        const regex = new RegExp(`^${newTopicTitle}$`, 'i')  
        const titleInDatabase = currentForum.topics.find(topic => regex.test(topic.title.trim()))
        if (titleInDatabase) {
            return res.send("Topic already exists")
        }

        currentForum.topics.push(req.body)
        currentForum.numTopics = currentForum.topics.length
        currentForum.numPosts = currentForum.topics.reduce((count, topic) => count + topic.posts.length, 0)
        await currentForum.save()
        res.redirect(`/forums/${req.params.forumId}`
        )
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// GET /forums/:forumId/:topicId
app.get("/forums/:forumId/:topicId", async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)

        // pagination
        const postsPerPage = 10
        const currentPage = parseInt(req.query.page) || 1
        const skip = (currentPage - 1) * postsPerPage


        // total pages
        const totalPosts = currentTopic.posts.length
        const totalPages = totalPosts > 0 ? Math.ceil(totalPosts / postsPerPage) : 1

        // visible posts
        const paginatedPosts = totalPosts > 0 ? currentTopic.posts.slice(skip, skip + postsPerPage) : []

        res.render("topics/show.ejs", {
            forum: currentForum, 
            topic: currentTopic,
            posts: paginatedPosts,
            currentPage,
            totalPages,
        })
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// DELETE /forums/:forumId/:topicId
app.delete("/forums/:forumId/:topicId", async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId).deleteOne()
        await currentForum.save()
        res.redirect(`/forums/${req.params.forumId}`)
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// GET /forums/:forumId/:topicId/edit
app.get("/forums/:forumId/:topicId/edit", isLoggedIn, async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentUser = await User.findById(req.session.user._id)
        username = currentUser.username
        const currentTopic = currentForum.topics.id(req.params.topicId)
        res.render("topics/edit.ejs", {
            forumId: req.params.forumId,
            topic: currentTopic,
            username
        })
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// PUT /forums/:forumId/:topicId
app.put("/forums/:forumId/:topicId", async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)
        currentTopic.set(req.body)
        await currentForum.save()
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// post
// POST /forums/:forumId/:topicId

app.post("/forums/:forumId/:topicId", async (req, res) => {
    try {
        // something here is crashing the server
        console.log('Forum ID:', req.params.forumId)
        console.log('Topic ID:', req.params.topicId)
        
        const currentForum = await Forum.findById(req.params.forumId)
        if (!currentForum) {
            console.log('Forum not found')
            return res.redirect(`/forums/${req.params.forumId}`)
        }
        const currentTopic = currentForum.topics.id(req.params.topicId)
        if (!currentTopic) {
            console.log('Topic not found')
            return res.redirect("/forums")
        }
        const currentUser = await User.findById(req.session.user._id)
        if (!currentUser) {
            console.log('User not found or not logged in')
            return res.redirect('/')
        }
        username = currentUser.username

        const newPost = {
            content: req.body.content,
            postedBy: username
        }

        currentTopic.posts.push(newPost)
        currentTopic.numPosts += 1
        await currentForum.save()

        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    }
})

// DELETE /forums/:forumId/:topicId:/:postId
app.delete("/forums/:forumId/:topicId/:postId", async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)

        const postToDelete = currentTopic.posts.id(req.params.postId)

        if (!postToDelete) {
            return res.status(404).send("Post not found")
        }

        const currentUser = await User.findById(req.session.user._id)
        if (postToDelete.postedBy !== currentUser.username && !currentUser.isAdmin) {
            return res.status(403).send("You are not authorized to delete this post.")
        }

        currentTopic.posts.pull(postToDelete)
        currentTopic.numPosts -= 1 
        await currentForum.save()

        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    }
})

// listen
app.listen(3000, () => {
    console.log(`Listening on port ${port}`)
})



// // predictions // consider moving to controllers
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
/*
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
*/