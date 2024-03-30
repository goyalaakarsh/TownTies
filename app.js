if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
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
const MONGO_URL = "mongodb://127.0.0.1:27017/townties";
const userRouter = require("./routes/user.js");
const multer = require('multer');
const { log } = require('console');
const { storage } = require("./cloudConfig.js");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Forum = require('./models/forum.js');
const Marketplace = require('./models/marketplace.js');
const upload = multer({ storage: storage });

main()
    .then(() => {
        console.log("Connected to Database.");
    })
    .catch((err) => {
        
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use("/", userRouter);
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

app.listen(3000, () => {
    console.log("Server is listening to port 3000!");
});

// Home Page
app.get("/", (req, res) => {
    res.render("layouts/home.ejs");
});

// Joining/Creating Forum
app.get("/joinforum", (req, res) => {
    res.render("forum/joinforum.ejs");
});

//Post Route-Create Product
app.post("/joinforum", upload.single("forum[icon]"), async (req, res) => {
    const newForum = new Forum(req.body.forum);
    let url = req.file.path;
    let filename = req.file.filename;
    newForum.icon = { url, filename };
    await newForum.save();
    const marketplace = await Marketplace.create({
        forum: newForum._id
    });
    res.redirect("/chats");
});

// Display Page for all Forums
app.get("/chats", wrapAsync(async (req, res) => {
    const allForums = await Forum.find({});
    res.render("forum/discussion.ejs", { allForums }); 
}));


// Page for a specific forum's chat
app.get("/forums/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const forum = await Forum.findById(id).populate('marketplace'); // Populate the marketplace field

    const allForums = await Forum.find({});

    res.render("forum/chat.ejs", { forum, allForums });
}));

// Marketplace of a specific Forum
app.get("/forums/:id/mart", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const forum = await Forum.findById(id).populate('marketplace');

    const allForums = await Forum.find({});


    const allProducts = await Product.find({forum: id});

    res.render("forum/mart.ejs", { forum, allForums, allProducts });
}));

app.get("/forums/:forumId/mart/products/:productId", wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;
    
    const forum = await Forum.findById(forumId).populate('marketplace');
    
    const product = await Product.findById(productId).populate('forum');

    res.render("layouts/product/product.ejs", { product, forum });
}));



// Editing the Product
app.get("/forums/:forumId/mart/products/:productId/editproduct", wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;
    const forum = await Forum.findById(forumId).populate('marketplace');
    
    const product = await Product.findById(productId).populate('forum');

    res.render("layouts/product/edit-product.ejs", { product, forum }); // Pass both product and forum variables
}));




// Adding a new Product in a specific Marketplace
app.get("/forums/:id/mart/newproduct", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const forum = await Forum.findById(id).populate('marketplace');

    const allForums = await Forum.find({});

    res.render("layouts/product/new-product.ejs", { forum, allForums });
}));

// Posting of the New Product
app.post("/forums/:id/mart/newproduct", upload.single("product[image]"), wrapAsync(async (req, res) => {
    const { id } = req.params;
        const newProduct = new Product(req.body.product);
        newProduct.forum = id;

        let url = req.file.path;
        let filename = req.file.filename;
        newProduct.image = { url, filename };
        
        console.log("Hi");

        // Save the new product o the database
        await newProduct.save();

        console.log(newProduct);

        // Redirect to the marketplace page
        res.redirect(`/forums/${id}/mart`);
    }
));






// Faaltu Routes


app.get("/mylistings", (req, res) => {
    res.render("layouts/profile/mylistings.ejs");
});

app.get("/users/login", (req, res) => {
    res.render("layouts/users/login.ejs");
});

app.get("/users/signup", (req, res) => {
    res.render("layouts/users/signup.ejs");
});

//Post Route-Create Product
app.post("/new-product", upload.single("product[image]"), async (req, res) => {
    const newProduct = new Product(req.body.product);
    let url = req.file.path;
    let filename = req.file.filename;
    newProduct.image = { url, filename };
    await newProduct.save();
    res.redirect("/mart");
});

app.get("/edit-product", (req, res) => {
    res.render("layouts/product/edit-product.ejs");
});

//Post Route- Edit Product
app.post("/edit-product", upload.single("product[image]"), async (req, res) => {
    const newProduct = new Product(req.body.product);
    let url = req.file.path;
    let filename = req.file.filename;
    newProduct.image = { url, filename };
    await newProduct.save();
    res.redirect("/mart");
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

app.get("/forums", wrapAsync(async (req, res) => {
const allForums = await Forum.find({});
res.render("/views/forums/forums.ejs", { allListings });
}))