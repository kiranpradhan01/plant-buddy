const mongoose = require('mongoose')
const {UserSchema} = require('./user.model')
const Schema = mongoose.Schema


const CommentSchema = new Schema({
    message: {
        type: String,
        required: true,
        minlength: 1
    },
    user: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

const Comment = mongoose.model('Comment', CommentSchema)
module.exports = {Comment, CommentSchema};
