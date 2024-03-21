const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlenght: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["manager", "coordinator", "student"], // Use enum to specify possible values
        required: false,
        default: null,
    },
    phoneNumber: {
        type: String,
    },
    city: {
        type: String,
    },
    gender: {
        type: String,
    },
    image: {
        type: String,
        required: true,
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: false,
    }
}, {timestamps:true});

const users = mongoose.model('User', userSchema);

module.exports = {
    User: users,
    roles: userSchema.path('role').enumValues, // Export enum values from schema
};