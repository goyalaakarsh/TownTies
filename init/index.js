const mongoose = require("mongoose");
const initData = require("./mart-data.js");
const Product = require("../models/product.js");

const MONGO_URL = "";

main()
    .then(() => {
        console.log("Connected to Mongo!");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Product.deleteMany({});
    await Product.insertMany(initData.data);
    console.log("Data was initialized!");
}

initDB();