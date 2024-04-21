const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        url: String,
        filename: String,
    },
    price: {
        type: Number,
        min: 1,
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the owner (user who listed the product)
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' } 
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
