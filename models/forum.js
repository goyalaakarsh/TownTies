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
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members of the forum
    discussionBoard: { type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionBoard' }, // One-to-one relationship with DiscussionBoard
    marketplace: { type: mongoose.Schema.Types.ObjectId, ref: 'Marketplace' } // One-to-one relationship with Marketplace
});

const Forum = mongoose.model('Forum', forumSchema);
module.exports = Forum;
