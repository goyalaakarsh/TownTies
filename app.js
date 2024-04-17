if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require("express");
const router = express.Router();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressErrors.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
// const { productSchema } = require("./models/product.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/townties";
const userRouter = require("./routes/user.js");
const multer = require('multer');
const { log } = require('console');
const { storage } = require("./cloudConfig.js");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require("./models/product.js")
const Forum = require('./models/forum.js');
const Marketplace = require('./models/marketplace.js');
const upload = multer({ storage: storage });
const sampleForum = require("./init/sample-forum.js");
const martData = require("./init/mart-data.js");

const {
    chatSchemaValidation,
    discussionBoardSchemaValidation,
    forumSchemaValidation,
    productSchemaValidation,
    userSchemaValidation,
} = require('./schema.js');
const sampleMartData = require('./init/mart-data.js');

let numberOfForums = 0;


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


// Remove this line, as sampleForum is already imported
// const sampleForum = new Forum.insertMany([{sampleForum}]);

// Checking if the number of forums is 0, then insert sample forum data
// async function isEmpty() {
//     if (numberOfForums == 0) {
//         // Insert the sample forum
//         await Forum.insertMany([sampleForum]);
//         numberOfForums++;

//         // Find the newly inserted forum
//         const newForum = await Forum.findOne({ name: sampleForum.name });

//         // Create an array to store the product documents
//         const productDocuments = [];

//         // Loop through the sampleMartData array to create product documents
//         for (const productData of sampleMartData) {
//             const product = new Product({
//                 ...productData,
//                 forum: newForum._id, // Assign the forum's _id to the product
//                 user: '60f8d91fa76fa45a18cf4d42' // Replace with the user's _id who is posting the products
//             });
//             productDocuments.push(product);
//         }

//         // Insert the products into the marketplace associated with the forum
//         await Marketplace.findOneAndUpdate(
//             { forum: newForum._id },
//             { $push: { products: productDocuments.map(doc => doc._id) } },
//             { upsert: true }
//         );

//         // Insert the product documents into the products collection
//         await Product.insertMany(productDocuments);
//     }
// }


// Call the isEmpty function to execute the logic
// isEmpty()
//     .then(() => {
//         console.log("Sample forum inserted successfully if the number of forums was 0.");
//     })
//     .catch((err) => {
//         console.error("Error while inserting sample forum:", err);
//     });



// Home Page
app.get("/", (req, res) => {
    res.render("layouts/home.ejs");
});


// Server Schema Validation Function
const validateChat = (req, res, next) => {
    let { error } = chatSchemaValidation.validate(req.body);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

const validateDiscussion = (req, res, next) => {
    let { error } = discussionBoardSchemaValidation.validate(req.body);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}
// const validateForum = (req, res, next) => {
//     let {error} = forumSchemaValidation.validate(req.body.forum);

//     if (error) {
//         throw new ExpressError (400, error);       
//     } else {
//         next();
//     }
// }

const validateProduct = (req, res, next) => {
    // console.log(req.body);
    let { error } = productSchemaValidation.validate(req.body.product);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}
const validateUser = (req, res, next) => {
    let { error } = userSchemaValidation.validate(req.body);

    if (error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

// Joining/Creating Forum
app.get("/joinforum", (req, res) => {
    res.render("forum/joinforum.ejs");
});

//Post Route-Create Product
app.post("/joinforum", upload.single("forum[icon]"), wrapAsync(async (req, res) => {
    console.log("hi");

    try {
        console.log("Received form data:", req.body);
        console.log("Received file data:", req.file);
        const newForum = new Forum(req.body.forum);

        if (req.file) {
            let url = req.file.path;
            let filename = req.file.filename;
            newForum.icon = { url, filename };
        } else {
            // If no file is uploaded, use default image URL
            newForum.icon = {
                url: "https://static.thenounproject.com/png/1526832-200.png",
                filename: 'default_image.jpg'
            };
        }

        await newForum.save();
        const marketplace = await Marketplace.create({
            forum: newForum._id
        });

        // numberOfForums++;
        res.redirect("/chats");

    } catch (error) {
        console.error("Error processing form data:", error);
        res.status(500).send("Internal Server Error"); // Send an error response if something goes wrong
    }
}));

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


    const allProducts = await Product.find({ forum: id });

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

app.put("/forums/:forumId/mart/products/:productId", validateProduct, upload.single("product[image]"), wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;
    const updatedProductData = req.body.product;

    let url = req.file.path;
    let filename = req.file.filename;
    updatedProductData.image = { url, filename };

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found.' });
        }

        // Update product data
        product.set(updatedProductData);

        // Save the updated product
        await product.save();

        res.redirect(`/forums/${forumId}/mart/products/${productId}`);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Server error.' });
    }
}));

//Delete Route 
app.delete("/forums/:forumId/mart/products/:productId", wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;

    // Delete the product by ID
    await Product.findByIdAndDelete(productId);

    // Remove the product ID from the products array in Marketplace
    await Marketplace.findOneAndUpdate({ forum: forumId }, { $pull: { products: productId } });

    res.redirect(`/forums/${forumId}/mart`);
}));


// Adding a new Product in a specific Marketplace
app.get("/forums/:id/mart/newproduct", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const forum = await Forum.findById(id).populate('marketplace');

    const allForums = await Forum.find({});

    res.render("layouts/product/new-product.ejs", { forum, allForums });
}));

// Posting of the New Product
app.post("/forums/:id/mart/newproduct", validateProduct, upload.single("product[image]"), wrapAsync(async (req, res) => {
    const { id } = req.params;
    const newProduct = new Product(req.body.product);
    newProduct.forum = id;

    let url = req.file.path;
    let filename = req.file.filename;
    newProduct.image = { url, filename };

    // Save the new product o the database
    await newProduct.save();

    await Marketplace.findOneAndUpdate({ forum: id }, { $push: { products: newProduct._id } });

    // Redirect to the marketplace page
    res.redirect(`/forums/${id}/mart`);
}
));


app.get("/forums/:forumId/mart/products/:productId/buy", wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;

    const forum = await Forum.findById(forumId).populate('marketplace');

    const product = await Product.findById(productId).populate('forum');

    res.render("layouts/payment.ejs", { product, forum });
}));


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