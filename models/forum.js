const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        url: String,
        filename: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    discussionBoard: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionBoard' },
    marketplace: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketplace' },
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }] // Reference to chat messages in this forum
});

const Forum = mongoose.model('Forum', forumSchema);
module.exports = Forum;
