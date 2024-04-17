const Joi = require('joi');

// Validation schema for Chat
const chatSchemaValidation = Joi.object({
    user: Joi.string().required(),
    message: Joi.string().required(),
    timestamp: Joi.date().timestamp(),
});

// Validation schema for DiscussionBoard
const discussionBoardSchemaValidation = Joi.object({
    chats: Joi.array().items(Joi.string()),
});

// Validation schema for Forum
const forumSchemaValidation = Joi.object({
    name: Joi.string().required(),
    icon: Joi.object({
        url: Joi.string(),
        filename: Joi.string(),
    }),
    members: Joi.array().items(Joi.string()),
    discussionBoard: Joi.string(),
    marketplace: Joi.string(),
});

// Validation schema for Marketplace
const marketplaceSchemaValidation = Joi.object({
    products: Joi.array().items(Joi.string()),
    forum: Joi.string(),
});

// Validation schema for Product
const productSchemaValidation = Joi.object({
    title: Joi.string(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    image: Joi.object({
        url: Joi.string(),
        filename: Joi.string(),
    }),
    price: Joi.number().required().min(1),
    contactNumber: Joi.number().required().min(1000000000).max(9999999999),
    user: Joi.string().required(),
    forum: Joi.string().required(),
});

// Validation schema for User
const userSchemaValidation = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    forums: Joi.array().items(Joi.string()),
    products: Joi.array().items(Joi.string()),
});

module.exports = {
    chatSchemaValidation,
    discussionBoardSchemaValidation,
    forumSchemaValidation,
    marketplaceSchemaValidation,
    productSchemaValidation,
    userSchemaValidation,
};
