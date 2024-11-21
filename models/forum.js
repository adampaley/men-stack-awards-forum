// import
const mongoose = require("mongoose")

// schema
const postSchema = new mongoose.Schema({
    content: { type: String, required: true},
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true 
})

const topicSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true},
    createdBy: String, // { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    numPosts: { type: Number, default: 0 },
    posts: [postSchema],
}, { timestamps: true 
})

const forumSchema = new mongoose.Schema({
    field: { type: String, required: true, unique: true, min: 1, trim: true }, // need to catch error for if a field is repeated, will generate an error because of "unique"
    description: { type: String, required: true, trim: true },
    numTopics: { type: Number, default: 0 },
    numPosts: { type: Number, default: 0 },
    topics: [topicSchema],
}, { timestamps: true
})

// middleware
// update topic count
forumSchema.methods.updateTopicCount = async function() {
    const topicCount = this.topics.length
    this.numTopics = topicCount
}

// update post count
forumSchema.methods.updatePostCount = async function() {
    let postCount = 0
    
    this.topics.forEach(topic => {
        postCount += topic.posts.length
    })
    
    this.numPosts = postCount
}

// make updates automatic
forumSchema.pre('save', async function(next) {
    if (this.isModified('topics')) {
        await this.updateTopicCount()
    }
    if (this.isModified('topics') || this.topics.some(topic => topic.isModified('posts'))) {
        await this.updatePostCount()
    }
    next()
})

// models
const Forum = mongoose.model('Forum', forumSchema)
const Topic = mongoose.model('Topic', topicSchema)
const Post = mongoose.model('Post', postSchema)

// export
module.exports = { Forum, Topic, Post }

// // update post count
// topicSchema.methods.updatePostCount = async function() {
//     let postCount = 0
    
//     this.topics.forEach(topic => {
//         postCount += topic.posts.length
//     })
    
//     this.numPosts = postCount
//     await this.save()
// }

// // make updates automatic
// topicSchema.pre('save', async function(next) {
//     if (this.isModified('numTopics')) {
//         await this.updateTopicCount()
//     }
//     if (this.isModified('numPosts')) {
//         await this.updatePostCount()
//     }
//     next()
// })