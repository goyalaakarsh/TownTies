const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const Product = require("./models/product.js")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressErrors.js");
const { productSchema } = require("./models/product.js");
// const { reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
// const MONGO_URL = "";

// main()
//     .then(() => {
//         console.log("Connected to Database.");
//     })
//     .catch((err) => {
//         console.log(err);
//     })

// async function main() {
//     await mongoose.connect(MONGO_URL);
// }

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
    res.send("Hello, I am root.");
});

app.use((err, req, res, next) => {
    let { statusCode, message } = err;
    res.render("error.ejs");
});

app.listen(3000, () => {
    console.log("Server is listening to port 3000!");
});

app.get("/forums", wrapAsync(async (req, res) => {
    const allForums = await Forum.find({});
    res.render("/views/forums/forums.ejs", { allListings });
}))