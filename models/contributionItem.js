const mongoose = require('mongoose');

const contributionItemSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    systemConfig: {
        type: mongoose.Schema.ObjectId,
        ref: 'SystemConfig',
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: false,
    },
    file: {
        type: mongoose.Schema.ObjectId,
        ref: 'File',
    },
}, { timestamps: true });
module.exports = mongoose.model('ContributionItem', contributionItemSchema);