const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const marketplaceSchema = new mongoose.Schema({
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Array of product references
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' }
});

const Marketplace = mongoose.model('Marketplace', marketplaceSchema);
module.exports = Marketplace;
