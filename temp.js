// const express = require('express');
// const app = express.app();
// const Product = require('../models/product'); // Import your Product model

// // POST request to add a new product to a specific marketplace
// app.post('/forums/:id/marketplace/:id/newproduct', async (req, res) => {
//     const { title, description, category, image, price, contactNumber } = req.body;
//     const marketplaceId = req.params.id;

//         // Create the new product and associate it with the marketplace
//         const product = await Product.create({
//             title,
//             description,
//             category,
//             image,
//             price,
//             contactNumber,
//             marketplace: marketplaceId // Associate the product with the specified marketplace ID
// });

//         res.status(201).json({ product });
// });

// module.exports = app;
