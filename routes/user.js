const express = require("express");
const router = express.Router();
const User = require("../models/user.js")

router.get("/signup", (req,res)=>{
    res.render("layouts/users/signup.ejs");
});

router.post("/signup", async (req, res) => {
    let { name, username, email, password } = req.body;
    try {
        const newUser = new User({ name, email, username });
        let registeredUser = await User.register(newUser, password);
        
        console.log(registeredUser); // Log the registered user
        // Redirect to home page after successful registration
        res.redirect("/");
    } catch (error) {
        console.log(error);

        // If there's an error, render the signup page again with an error message
        res.render("layouts/users/signup.ejs", { error: error.message });
    }
});

module.exports = router;