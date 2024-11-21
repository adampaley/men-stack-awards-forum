// import
const mongoose = require("mongoose")

// contenderSchema
const contenderSchema = new mongoose.Schema({
    name: String,
    rank: { type: Number, min: 1, max: 5},
    points: { type: Number}
})

// schmea
const predictionSchema = new mongoose.Schema({
    category: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    contenders: [contenderSchema]
})

// prevent multiple predictions per user per category
predictionSchema.index({ user: 1, category: 1 }, { unique: true })

const Prediction = mongoose.model("Prediction", predictionSchema)

// exports
module.exports = Prediction