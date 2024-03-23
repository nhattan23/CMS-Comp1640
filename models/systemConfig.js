const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    closureDate: Date,
    finalDate: Date,
}, { timestamps: true });

module.exports = mongoose.model("SystemConfig", systemConfigSchema);
