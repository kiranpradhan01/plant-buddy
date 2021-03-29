const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {UserSchema} = require('./user.model')
const {CommentSchema} = require('./comment.model')

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    user: {
        type: String,
        required: false,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    plantID: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
})

const Post = mongoose.model('Post', postSchema)
module.exports = Post;
