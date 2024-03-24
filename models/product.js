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
        data: Buffer, // Store the image data as a Buffer
        contentType: String // Store the content type of the image
    },
    price: {
        type: Number,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who posted the product
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' } // Reference to the forum where the product is posted
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
