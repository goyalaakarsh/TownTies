const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
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
    contactnum: {
        type: Number,
    },
    // pfp : {
    //     url: String,
    //     filename: String
    // },

    forums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }],
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;