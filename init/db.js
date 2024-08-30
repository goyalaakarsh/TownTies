const mongoose = require("mongoose");
const initData = require("./mart-data.js");
const Product = require("../models/product.js");

const MONGO_URL = "mongodb+srv://aakarshgoyal23:town@cluster0.inrcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB!");

        await initDB();
        console.log("Data initialization completed!");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    } finally {
        mongoose.disconnect(); // Close the MongoDB connection after initialization
        console.log("MongoDB connection closed.");
    }
}

// async function initDB() {
//     try {
//         await Product.deleteMany({});
//         const insertedProducts = await Product.insertMany(initData.data);
//         console.log(`${insertedProducts.length} products inserted into the database.`);
//     } catch (err) {
//         console.error("Error initializing data:", err);
//     }
// }

main();
