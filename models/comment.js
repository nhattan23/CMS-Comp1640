const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentText: {
        type: String,
        require: true,
    },
    faculty: {
        type: mongoose.Schema.ObjectId,
        required: false,
        ref: "Faculty",
    },
    contribution: {
        type: mongoose.Schema.ObjectId,
        ref: 'Contribution',
    },
}, { timestamps: true });

module.exports = mongoose.model("Comment", commentSchema);
