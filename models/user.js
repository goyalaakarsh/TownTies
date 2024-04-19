// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-Local-Mongoose')

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     username: {
//         type: String,
//         required: true,
//         unique: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true 
//     },
    
//     forums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }], // User can be a member of multiple forums
//     products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // User can post multiple products
// });

// userSchema.plugin(passportLocalMongoose);
// const User = mongoose.model('User', userSchema);

// module.exports = User;

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
    forums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }], 
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] 
});

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;
