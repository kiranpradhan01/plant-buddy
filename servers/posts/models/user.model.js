const mongoose = require('mongoose')

const Schema = mongoose.Schema

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};


const UserSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        trim: true,
        minlength: 1
    },

    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },

    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    hashPass:  {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
}, {
    timestamps: true,
})

const User = mongoose.model('User', UserSchema)
module.exports = {User, UserSchema};
