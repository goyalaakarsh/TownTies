const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
    password: {
        type: String,
        required: true
    },
    forums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }], // User can be a member of multiple forums
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // User can post multiple products
});

const User = mongoose.model('User', userSchema);
module.exports = User;