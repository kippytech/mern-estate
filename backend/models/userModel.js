const mongoose = require('mongoose')

const userSchema =  new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://cdn.pixabay.com/vectors/blank-profile-picture-mystery-man-973460_1280.png"
    }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)