// const express = require("express");
// const router = express.Router();
// const User = require("../models/user.js")

// router.get("/signup", (req,res)=>{
//     res.render("layouts/users/signup.ejs");
// });

// router.post("/signup", async (req, res) => {
//     let { name, username, email, password } = req.body;
//     try {
//         const newUser = new User({ name, email, username });
//         let registeredUser = await User.register(newUser, password);

//         console.log(registeredUser); 
//         res.redirect("/");
//     } catch (error) {
//         console.log(error);

//         // If there's an error, render the signup page again with an error message
//         res.render("layouts/users/signup.ejs", { error: error.message });
//     }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const User = require("../models/user.js");

router.get("/signup", (req, res) => {
    res.render("layouts/users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    const { name, username, email, password } = req.body; // Extract password from req.body

    try {
        const newUser = new User({ name, username, email }); // Use extracted data to create new user
        let registeredUser = await User.register(newUser, password);

        console.log(registeredUser);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("layouts/users/signup.ejs", { error: error.message });
    }
});

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const passport = require("passport");
// const User = require("../models/user.js");

// // Render login form
// router.get("/login", (req, res) => {
//     res.render("layouts/users/login.ejs");
// });

// // Handle login logic
// router.post("/login", passport.authenticate("local", {
//     successRedirect: "/", // Redirect to home page on successful login
//     failureRedirect: "/users/login", // Redirect back to login page on failed login
//     failureFlash: true // Enable flash messages for failed login attempts
// }));

// module.exports = router;
