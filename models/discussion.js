const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionBoardSchema = new mongoose.Schema({
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }], // Array of chat references
});

const DiscussionBoard = mongoose.model('DiscussionBoard', discussionBoardSchema);
module.exports = DiscussionBoard;