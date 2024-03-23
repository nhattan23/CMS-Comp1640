const mongoose = require('mongoose');

const contributionItemSchema = mongoose.Schema({
    text: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
}, { timestamps: true });
module.exports = mongoose.model('ContributionItem', contributionItemSchema);