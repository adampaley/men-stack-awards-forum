// import
const mongoose = require("mongoose")

// schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true }, // consider username being stored all lower case and a separate display name
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true},
//    profilePictureUrl: { type: String },
//    bio: { type: String },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now } //,
//    updatedAt: { type: Date, default: Date.now}
})

const User = mongoose.model("User", userSchema)

// export
module.exports = User