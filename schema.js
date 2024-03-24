const Joi = require('joi');

// Joi schema for Chat
const chatSchema = Joi.object({
    user: Joi.string().required(),
    message: Joi.string().required(),
    timestamp: Joi.date().default(Date.now, 'current timestamp'),
});

// Joi schema for DiscussionBoard
const discussionBoardSchema = Joi.object({
    chats: Joi.array().items(Joi.string().required()), // Array of chat references
});

// Joi schema for Forum
const forumSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('join', 'create').required(),
    icon: Joi.string(),
    members: Joi.array().items(Joi.string().required()), // Members of the forum
    discussionBoard: Joi.string().required(), // One-to-one relationship with DiscussionBoard
    marketplace: Joi.string().required(), // One-to-one relationship with Marketplace
});

// Joi schema for Marketplace
const marketplaceSchema = Joi.object({
    products: Joi.array().items(Joi.string().required()), // Array of product references
});

// Joi schema for Product
const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    image: Joi.object({
        data: Joi.binary(),
        contentType: Joi.string(),
    }),
    price: Joi.number().required(),
    contactNumber: Joi.string().required(),
    user: Joi.string().required(), // Reference to the user who posted the product
    forum: Joi.string().required(), // Reference to the forum where the product is posted
});

// Joi schema for User
const userSchema = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    forums: Joi.array().items(Joi.string().required()), // User can be a member of multiple forums
    products: Joi.array().items(Joi.string().required()), // User can post multiple products
});

module.exports = {
    chatSchema,
    discussionBoardSchema,
    forumSchema,
    marketplaceSchema,
    productSchema,
    userSchema,
};
