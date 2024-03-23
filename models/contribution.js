const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    file: {
        type: mongoose.Schema.ObjectId,
        ref: 'File',
    },
    status: {
        type: String,
        enum: ["submitted", "not submit"],
        required: false,
    },
    users: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    systemConfig: {
        type: mongoose.Schema.ObjectId,
        ref: 'SystemConfig',
    },
}, { timestamps: true });

module.exports = mongoose.model('Contribution', contributionSchema);