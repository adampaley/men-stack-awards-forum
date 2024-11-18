// require
const mongoose = require("mongoose")

// schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unqiue: true, required: true },
    password: { type: String, required: true},
//    profilePictureUrl: { type: String },
//    bio: { type: String },
    createdAt: { type: Date, default: Date.now } //,
//    updatedAt: { type: Date, default: Date.now}
})

const User = mongoose.models("User", userSchema)

// export
module.exports = User