// imports 
const express = require('express')
const router = express.Router()
const { Forum, Topic } = require("../models/forum.js")
const User = require('../models/user.js')
const isAdmin = require("../middleware/is-admin.js")
const isLoggedIn = require("../middleware/is-logged-in.js")
const allowPagination = require('../middleware/pagination')

// routes

// forums
// GET /forums
router.get("/",  async (req, res) => {
    const allForums = await Forum.find()
    const pageTitle = "Forums - "
    res.render("forums/index.ejs", { forums: allForums, pageTitle })
})

// GET /forums/new
router.get("/new", isAdmin, (req, res) => {
    const pageTitle = "Launch New Forum - "
    res.render("forums/new.ejs", { pageTitle })
})

// POST /forums
router.post("/", async (req, res) => {
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
router.get("/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    const pageTitle = `${foundForum.field} - `
    res.render("forums/show.ejs", { forum: foundForum, topics: foundForum.topics, pageTitle })
})

// DELETE /forums/:forumId
router.delete("/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    await Forum.findByIdAndDelete(req.params.forumId)
    res.redirect("/forums")
})

// GET /forums/:forumId/edit
router.get("/:forumId/edit", isAdmin, async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    const foundForum = await Forum.findById(req.params.forumId)
    const pageTitle = "Edit Forum - "
    res.render("forums/edit.ejs", { forum: foundForum, pageTitle })
})

// PUT /forums/:forumId
router.put("/:forumId", async (req, res) => { // consider making the parameter related to forum name once 1) duplicates are prevented and 2) admin authority required
    await Forum.findByIdAndUpdate(req.params.forumId, req.body)
    res.redirect(`/forums/${req.params.forumId}`)
})

// topics
// GET /forums/:forumId/new
router.get("/:forumId/new", isLoggedIn, async (req, res) => {
    const forum = req.params.forumId
    const currentUser = await User.findById(req.session.user._id)
    username = currentUser.username
    const pageTitle = "Start a New Discussion - "
    res.render("topics/new.ejs", { forum, username, pageTitle })
})

// POST /forums/:forumsId
router.post("/:forumId", isLoggedIn, async (req, res) => {
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
router.get("/:forumId/:topicId", allowPagination, async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)
        const pageTitle = `${currentTopic.title} - `

        res.render("topics/show.ejs", {
            forum: currentForum, 
            topic: currentTopic,
            posts: res.locals.pagination.posts,
            currentPage: res.locals.pagination.currentPage,
            totalPages: res.locals.pagination.totalPages,
            pageTitle,
        })
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// DELETE /forums/:forumId/:topicId
router.delete("/:forumId/:topicId", async (req, res) => {
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
router.get("/:forumId/:topicId/edit", isLoggedIn, async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentUser = await User.findById(req.session.user._id)
        username = currentUser.username
        const currentTopic = currentForum.topics.id(req.params.topicId)
        const pageTitle = `Editing ${currentTopic.title} - `
        res.render("topics/edit.ejs", {
            forumId: req.params.forumId,
            topic: currentTopic,
            username,
            pageTitle
        })
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}`)
    }
})

// PUT /forums/:forumId/:topicId
router.put("/:forumId/:topicId", async (req, res) => {
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

// posts
// POST /forums/:forumId/:topicId
router.post("/:forumId/:topicId", allowPagination, async (req, res) => {
    try {
        const currentForum = await Forum.findById(req.params.forumId)
        const currentTopic = currentForum.topics.id(req.params.topicId)
        const currentUser = await User.findById(req.session.user._id)

        const newPost = {
            content: req.body.content,
            postedBy: currentUser.username
        };

        currentTopic.posts.push(newPost)
        currentTopic.numPosts += 1
        await currentForum.save()

        const totalPosts = currentTopic.posts.length
        const totalPages = Math.ceil(totalPosts / res.locals.pagination.postsPerPage)
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}?page=${totalPages}`)
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    }
})

// DELETE /forums/:forumId/:topicId:/:postId
router.delete("/:forumId/:topicId/:postId", allowPagination, async (req, res) => {
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

        const totalPosts = currentTopic.posts.length
        const totalPages = Math.ceil(totalPosts / res.locals.pagination.postsPerPage)
        const currentPage = res.locals.pagination.currentPage

        if (totalPosts === 0) { // If no posts
            res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}?page=1`)
        } else if (currentPage === totalPages) { // If posts still on page
            res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}?page=${currentPage}`)
        } else  { // If no posts on page
            res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}?page=${totalPages}`)
        } 
    } catch (error) {
        console.log(error)
        res.redirect(`/forums/${req.params.forumId}/${req.params.topicId}`)
    }
})

//exports
module.exports = router