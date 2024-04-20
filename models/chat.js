const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true } // Reference to the forum
});


const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;