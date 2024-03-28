const express = require("express");
const router = express.Router();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const Product = require("./models/product.js")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressErrors.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { productSchema } = require("./models/product.js");
// const { reviewSchema } = require("./schema.js");
// const Review = require("./models/review.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/townties";
const userRouter = require("./routes/user.js");
main()
    .then(() => {
        console.log("Connected to Database.");
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use("/",userRouter);
app.engine("ejs", ejsMate);

app.use(session({
    secret: 'your_secret_key', // Set your own secret key
    resave: false,
    saveUninitialized: true
}));


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/demouser", async(req,res) => {
//     let fakeUser = new User({
//         email:"student@gmail.com",
//         username: "delta-student",
//         password: "your_password", // Add a password
//         name: "Your Name" // Add a name
//     });
//     let registeredUser = await User.register(fakeUser, "helloworld"); 
//     res.send(registeredUser);
// });


app.get("/", (req, res) => {
    res.render("layouts/home.ejs");
});

app.get("/joinforum", (req, res) => {
    res.render("forum/joinforum.ejs");
});

app.get("/chats", (req, res) => {
    res.render("forum/discussion.ejs");
});

app.get("/users/profile", (req, res) => {
    res.render("layouts/profile/profile.ejs");
});

app.get("/mylistings", (req, res) => {
    res.render("layouts/profile/mylistings.ejs");
});

app.get("/users/login", (req, res) => {
    res.render("layouts/users/login.ejs");
});

app.get("/users/signup", (req, res) => {
    res.render("layouts/users/signup.ejs");
});

app.get("/new-product", (req, res) => {
    res.render("layouts/product/new-product.ejs");
});
app.get("/edit-product", (req, res) => {
    res.render("layouts/product/edit-product.ejs");
});
app.get("/product", (req, res) => {
    res.render("layouts/product/product.ejs");
});
app.get("/mart", (req, res) => {
    res.render("forum/mart.ejs");
});

app.get("/payment", (req, res) => {
    res.render("layouts/payment.ejs");
});

// app.use((err, req, res, next) => {
//     let { statusCode, message } = err;
//     res.render("error.ejs");
// });

app.listen(3000, () => {
    console.log("Server is listening to port 3000!");
});

app.get("/forums", wrapAsync(async (req, res) => {
    const allForums = await Forum.find({});
    res.render("/views/forums/forums.ejs", { allListings });
}))

