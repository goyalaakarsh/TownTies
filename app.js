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
const flash = require("connect-flash")
const bodyParser = require("body-parser");
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const Chat = require('./models/chat.js');

const io = socketIO(server); 

io.on('connection', (socket) => {
    console.log('A user connected');

    // Receive chat messages from clients
    socket.on('send', async (data) => {
        console.log('Received chat message:', data);

        try {
            // Save the message to your database
            const newChatMessage = new Chat({
                user: data.sender,
                message: data.message,
                forum: data.forumId // Assuming you're passing forumId from the frontend
            });

            await newChatMessage.save();

            // Retrieve all chat messages for the current forum
            const allChatMessages = await Chat.find({ forum: data.forumId });

            // Broadcast the message to all clients 
            socket.broadcast.emit('recieve', {message: data, name: user[socket.id]}); // You can refine this to only emit to specific rooms or namespaces if needed
        } catch (err) {
            console.error('Error saving or retrieving chat message:', err);
        }
    });

    // Other socket.io event listeners as needed
});

// Other routes and middleware as needed


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const {
    chatSchemaValidation,
    discussionBoardSchemaValidation,
    forumSchemaValidation,
    productSchemaValidation,
    userSchemaValidation,
} = require('./schema.js');
const sampleMartData = require('./init/mart-data.js');

const sessionOptions = {
    secret: 'mujhekyamaintohbatakhun',
    resave: false,
    saveUninitialized: true
};

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use("/", userRouter);
app.engine("ejs", ejsMate);
app.use(express.json());
app.use(session(sessionOptions));
app.use(flash());
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(8080, () => {
    console.log("Server is listening to port 8080!");
});

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
    console.log(req.body);
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

// Home Page
app.get("/", (req, res) => {
    res.render("layouts/home.ejs");
});

app.get("/profile", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        try {
            const currentUser = await User.findById(userId);
            if (!currentUser) {
                throw new Error("User not found");
            }
            const returnTo = req.query.returnTo || "/";
            res.render("layouts/profile/profile.ejs", { currentUser, returnTo });
        } catch (err) {
            console.error("Error fetching user:", err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect(`/login?returnTo=${encodeURIComponent(req.originalUrl)}`);
    }
});

// GET route to render the edit profile page

app.get("/edit-profile", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        try {
            const currentUser = await User.findById(userId);
            if (!currentUser) {
                throw new Error("User not found");
            }

            res.render("layouts/profile/edit-profile.ejs", { currentUser });
        } catch (err) {
            console.error("Error fetching user for editing profile:", err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect("/login");
    }
});

app.post("/edit-profile", async (req, res) => {
    try {
        console.log(req.body);
        if (req.isAuthenticated()) {
            const userId = req.user._id;

            // Extract user data from the request body
            const userData = req.body.user;

            // Validate user data
            const { error } = userSchemaValidation.validate(userData);
            if (error) {
                console.error("Validation error:", error.details);
                return res.status(400).send("Validation error");
            }

            // Update user profile in the database
            const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

            if (!updatedUser) {
                throw new Error("User not found");
            }

            // Redirect to the profile page after successful update
            res.redirect("/profile");
        } else {
            // Redirect to login page if user is not authenticated
            res.redirect("/login");
        }
    } catch (err) {
        console.error("Error updating user profile:", err);
        res.status(500).send("Internal Server Error");
    }
});

// app.post("/profile", async(req, res) => {
//     console.log(req.body.user);
//     if (req.isAuthenticated()) {
//         const userId = req.user._id;
//         try {
//             const { error } = userSchemaValidation.validate(req.body.user);
//             if (error) {
//                 console.error("Validation error:", error.details);
//                 res.status(400).send("Validation error");
//                 return;
//             }
//             const updatedUser = await User.findByIdAndUpdate(userId, req.body.user, { new: true });
//             if (!updatedUser) {
//                 throw new Error("User not found");
//             }
//             res.redirect("/profile");
//         } catch (err) {
//             console.error("Error updating user profile:", err);
//             res.status(500).send("Internal Server Error");
//         }
//     } else {
//         res.redirect("/login");
//     }
// });

app.get("/mylistings", async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        try {
            const currentUser = await User.findById(userId).populate("products");
            if (!currentUser) {
                throw new Error("User not found");
            }
            res.render("layouts/profile/mylistings.ejs", { myProducts: currentUser.products });
        } catch (err) {
            console.error("Error fetching user:", err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect("/login");
    }



});

// Joining/Creating Forum
app.get("/joinforum", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("forum/joinforum.ejs");
    } else {
        res.redirect("/login");
    }
});

// Store forum namespaces in an object
const forumNamespaces = {};
app.post("/joinforum", upload.single("forum[icon]"), wrapAsync(async (req, res) => {
    console.log("Join Route Active");
    console.log("Received form data:", req.body);
    console.log("Received file data:", req.file);

    try {
        const { forumType, forumref } = req.body; // Updated field name to forumref

        if (forumType === 'join') {
            console.log("In Join Forum Type");
            const existingForum = await Forum.findById(forumref);
            console.log("Forum Referral ID:", forumref);
            console.log("Existing Forum:", existingForum);

            if (!existingForum) {
                throw new Error("Forum not found");
            }

            if (req.user._id.toString() !== existingForum.owner.toString()) {
                // Store the forum ID in the user's forums array
                req.user.forums.push(existingForum._id);
                await req.user.save();
            } else {
                res.redirect("/joinforum");
            }

            // Connect the user to the forum namespace if it exists
            const forumNamespace = forumNamespaces[existingForum._id];
            if (forumNamespace) {
                forumNamespace.sockets[req.user._id] = req.user;
            } else {
                throw new Error("Forum namespace not found");
            }

            existingForum.members.push(req.user._id);
            await existingForum.save();

            res.redirect("/chats");
        } else if (forumType === 'create') {
            const newForumData = {
                ...req.body.forum,
                owner: req.user._id,
                members: [req.user._id]
            };
            const newForum = new Forum(newForumData);

            if (req.file) {
                let url = req.file.path;
                let filename = req.file.filename;
                newForum.icon = { url, filename };
            } else {
                newForum.icon = {
                    url: "https://static.thenounproject.com/png/1526832-200.png",
                    filename: 'default_image.jpg'
                };
            }

            await newForum.save();

            // Create a new Socket.IO namespace for the forum with forum ID as namespace name
            const forumNamespace = io.of(`/${newForum._id}`);
            forumNamespaces[newForum._id] = forumNamespace; // Store the namespace in forumNamespaces object

            forumNamespace.on('connection', (socket) => {
                console.log(`New client connected to forum namespace ${newForum._id}`);
                // Handle events within this namespace
            });

            req.user.forums.push(newForum._id);
            await req.user.save();

            res.redirect("/chats");
        } else {
            throw new Error("Invalid forum type");
        }
    } catch (error) {
        console.error("Error processing form data:", error);
        res.status(500).send("Internal Server Error");
    }
}));


// Post Route - Create Forum
// app.post("/joinforum", upload.single("forum[icon]"), wrapAsync(async (req, res) => {
//     console.log("Received form data:", req.body);
//     console.log("Received file data:", req.file);

//     try {
//         const { forumType, forumReferral } = req.body;

//         if (forumType === 'join') {
//             const existingForum = await Forum.findById(forumReferral);
//             if (!existingForum) {
//                 throw new Error("Forum not found");
//             }

//             existingForum.members.push(req.user._id);
//             await existingForum.save();

//             res.redirect("/chats");
//         } else if (forumType === 'create') {
//             const newForumData = {
//                 ...req.body.forum,
//                 owner: req.user._id,
//                 members: [req.user._id]
//             };
//             const newForum = new Forum(newForumData);

//             if (req.file) {
//                 let url = req.file.path;
//                 let filename = req.file.filename;
//                 newForum.icon = { url, filename };
//             } else {

//                 newForum.icon = {
//                     url: "https://static.thenounproject.com/png/1526832-200.png",
//                     filename: 'default_image.jpg'
//                 };
//             }
//             await newForum.save();

//             req.user.forums.push(newForum._id);
//             await req.user.save();

//             const marketplace = await Marketplace.create({
//                 forum: newForum._id
//             });

//             res.redirect("/chats");
//         } else {
//             throw new Error("Invalid forum type");
//         }
//     } catch (error) {
//         console.error("Error processing form data:", error);
//         res.status(500).send("Internal Server Error");
//     }
// }));

// Display Page for all Forums
app.get("/chats", wrapAsync(async (req, res) => {
    if (req.isAuthenticated()) {
        const userId = req.user._id;
        try {
            const currentUser = await User.findById(userId).populate({
                path: 'forums',
                populate: {
                    path: 'owner',
                    select: 'username'
                }
            });

            if (!currentUser) {
                throw new Error("User not found");
            }

            console.log("Current User:", currentUser);
            console.log("User Forums:", currentUser.forums);
            res.render("forum/discussion.ejs", { myForums: currentUser.forums });
        } catch (err) {
            console.error("Error fetching user:", err);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.redirect("/login");
    }
}));

app.get("/login", (req, res) => {
    const returnTo = req.query.returnTo || "/";
    res.render("layouts/users/login.ejs");
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        try {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal Server Error");
            }
            if (!user) {
                req.flash("error", "Invalid username or password");
                return res.redirect("/login");
            }
            const currentUser = await User.findOne({ username: req.body.username });
            if (!currentUser) {
                console.error("User not found");
                return res.status(404).send("User not found");
            }
            console.log(currentUser.id);

            req.logIn(user, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Internal Server Error");
                }
                const returnTo = req.session.returnTo || "/";
                delete req.session.returnTo;
                res.redirect(returnTo);
            });
        } catch (error) {

            console.error(error);
            return res.status(500).send("Internal Server Error");
        }
    })(req, res, next);
});


// Page for a specific forum's chat
app.get("/forums/:id", wrapAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await Forum.findById(id)
            .populate('marketplace')
            .populate('messages.user', 'name'); // Populate the 'user' field in 'messages' with just the 'name' field

        if (!forum) {
            return res.status(404).send("Forum not found");
        }

        const allForums = await Forum.find({ members: req.user._id });
        
        // Fetch chat messages for the forum and pass them to the template
        const chatMessages = forum.messages.map(data => ({
            senderName: data.senderName,
            message: data.content // Assuming the content of the message is stored in 'content' field
        }));

        res.render("forum/chat.ejs", { forum, allForums, currentUser: req.user, chatMessages });
    } catch (err) {
        console.error("Error fetching forum:", err);
        res.status(500).send("Internal Server Error");
    }
}));


app.post("/forums/:id", async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    console.log("Ze message is:     ", message);
    try {
        
        const forum = await Forum.findById(id);

        if (!forum) {
            return res.status(404).send("Forum not found");
        }
        
        const newChatMessage = new Chat({
            user: req.user._id,
            message,
            forum: forum._id
        });
        
        await newChatMessage.save();

        // Update the forum's messages array
        forum.messages.push(newChatMessage);
        await forum.save();
        
        // Broadcast the message to all clients in the forum namespace
        io.of(`/${id}`).emit('receive', { senderName: req.user.name, message }); // Emit 'receive' event
        // res.status(200).send("Message sent");
        res.redirect(`/forums/${id}`)
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).send("Internal Server Error");
        console.log(err);
    }
});



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

        product.set(updatedProductData);
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
    await Product.findByIdAndDelete(productId);
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
    console.log("Received form data:", req.body);
    console.log("Received file data:", req.file);
    const { id } = req.params;
    const newProduct = new Product(req.body.product);
    newProduct.forum = id;
    let url = req.file.path;
    let filename = req.file.filename;
    newProduct.image = { url, filename };

    await newProduct.save();

    if (req.isAuthenticated() && req.user && req.user.products) {
        req.user.products.push(newProduct._id);
        await req.user.save();
    } else {
        console.error("User authentication error or products array missing");
    }

    await Marketplace.findOneAndUpdate({ forum: id }, { $push: { products: newProduct._id } });
    res.redirect(`/forums/${id}/mart`);
}));

app.get("/forums/:forumId/mart/products/:productId/buy", wrapAsync(async (req, res) => {
    const { forumId, productId } = req.params;
    const forum = await Forum.findById(forumId).populate('marketplace');
    const product = await Product.findById(productId).populate('forum');
    res.render("layouts/payment.ejs", { product, forum });
}));

app.get("/signup", (req, res) => {
    res.render("layouts/users/signup.ejs");
});

app.get("/mylistings", async (req, res) => {
    try {
        const myProducts = await Product.find({ owner: req.user._id }).populate('forum');
        const forumId = req.params.forumId; // Assuming forumId is available in your route handler

        res.render("layouts/profile/mylistings.ejs", { myProducts, forumId });
    } catch (err) {
        console.error("Error fetching user's products:", err);
        res.status(500).send("Internal Server Error");
    }
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