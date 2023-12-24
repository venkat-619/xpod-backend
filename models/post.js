const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    location: String,
    description: {
        type: String,
        required: true
    },
    postImage: {
        id: {
            type: String
        },
        secure_url: {
            type: String
        }
    },
    userImage: String,
    likes: {
        type: Map,
        of: Boolean // values stored in the map of type boolean
    },
    rePost: {
        type: Map,
        of: Boolean
    },
    comments: {
        type: Array,
        default: [],
    },
    userId: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);