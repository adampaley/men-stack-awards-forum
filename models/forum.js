// import
const mongoose = require("mongoose")

// schema
const forumSchema = new mongoose.Schema({
    field: { type: String, required: true, unique: true, trim: true }, // need to catch error for if a field is repeated, will generate an error because of "unique"
    description: { type: String, required: true, trim: true },
    numTopics: { type: Number, default: 0 },
    numPosts: { type: Number, default: 0 },
}, { timestamps: true
})

// middleware
// update topic count
forumSchema.methods.updateTopicCount = async function() {
    const topicCount = await mongoose.model('Topic').countDocuments({ category: this._id })
    this.numTopics = topicCount
    await this.save()
}

// update post count
forumSchema.methods.updatePostCount = async function() {
    const postCount = await mongoose.model('Post').countDocuments({ category: this._id })
    this.numPosts = postCount
    await this.save()
}

// make updates automatic
forumSchema.pre('save', async function(next) {
    if (this.isModified('numTopics')) {
        await this.updateTopicCount()
    }
    if (this.isModified('numPosts')) {
        await this.updatePostCount()
    }
    next()
})

const Forum = mongoose.model('Forum', forumSchema)

// export
module.exports = Forum