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
        required: true
    },
    contactNumber: {
        type: Number,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who posted the product
    marketplace: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketplace' } // Reference to the marketplace where the product is posted
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;