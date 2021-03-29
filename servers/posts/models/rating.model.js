const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ratingSchema = new Schema({
    plantID: {
        type: String,
        required: true,
    },
    difficulty: {
        type: Number,
        required: true,
    },
    live_giving: {
        type: Number,
        required: true,
    },
    expensive: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
})

const Rating = mongoose.model('Rating', ratingSchema)
module.exports = Rating;