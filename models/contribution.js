const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
    file: {
        type: mongoose.Schema.ObjectId,
        ref: 'File',
        required: false,
    },
    status: {
        type: String,
        required: false,
    },
    users: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    contributionItem: {
        type: mongoose.Schema.ObjectId,
        ref: 'ContributionItem',
        required: true,
    }
}, { timestamps: true });
contributionSchema.pre('save', function(next) {
    if (this.file) {
        this.status = 'Submitted';
    } else {
        this.status = 'Not Attempt';
    }
    next();
});
module.exports = mongoose.model('Contribution', contributionSchema);