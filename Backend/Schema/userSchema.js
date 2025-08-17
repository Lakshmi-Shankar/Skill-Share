const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    skills: {
        type: [String],
        default: []
    },
    credit: {
        type: Number,
        default: 1
    },
    password: {
        type: String,
        required: true
    },
}, { timestamps: true});

module.exports = mongoose.model("User", UserSchema);

