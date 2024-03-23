const bcrypt = require('bcrypt');
const Admin = require('../models/admin');
const { User, roles } = require('../models/user'); // Đảm bảo đường dẫn đúng tới tệp model User
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');
const multer = require('multer');
const ContributionItem = require('../models/contributionItem');
const Contribution = require('../models/contribution');
const FileModel = require('../models/file');
const fs = require('fs');
const path = require("path");
const helpers = require('../helpers');

// upload image
const storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads_Image/");
    },
    filename: function (req, file, cb) {
        // Generate a unique filename using the fieldname, current timestamp, and original filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '_' + uniqueSuffix + '_' + file.originalname);
    }
});

const storageArticle = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads_Article/");
    },
    filename: function (req, file, cb) {
        // Define allowed file extensions
        const allowedExtensions = ['.docs', '.doc', '.pdf', '.jpg', '.svg', '.png'];
        // Check if the file extension is in the allowed list
        const fileExt = '.' + file.originalname.split('.').pop().toLowerCase();
        if (allowedExtensions.includes(fileExt)) {
            // Generate a unique filename using the fieldname, current timestamp, and original filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '_' + uniqueSuffix + '_' + file.originalname);
        } else {
            // If the file extension is not allowed, return an error
            cb(new Error('File type not allowed'));
        }
    }
});

const uploadImage = multer({
    storage: storageImage, fileFilter: helpers.imageFilter
}).array('image', 10);

const uploads = multer({
    storage: storageArticle,
}).array('files', 10);

const submissionController = {
    submissionSite: async (req, res) => {
        const contribute = await Contribution.find().populate('file')
        res.render('users/formSubmission', { title: "Submission Page", contribute: contribute });
    },

    uploadFile: async (req, res) => {
        uploads(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message, type: "danger" });
            }
            try {
                // Check if files are present
                if (!req.files || req.files.length === 0) {
                    return res.status(400).json({ message: 'No files uploaded' });
                }
    
                // Array to hold promises for file saving
                const filePromises = [];
                const contributionPromises = [];
    
                // Iterate over files and save them
                req.files.forEach((file) => {
                    // Read file data
                    const fileData = fs.readFileSync(file.path);
    
                    // Create file object
                    const newFile = new FileModel({
                        filename: file.filename,
                        contentType: file.mimetype,
                        data: fileData,
                    });
    
                    // Push the promise to the array
                    filePromises.push(newFile.save());
    
                    // Create contribution object
                    const newContribute = new Contribution({
                        file: newFile._id,
                        status: "submitted", // Set status to "submitted" as per your requirement
                        users: req.user._id, // Assuming you have user information available in req.user
                        systemConfig: req.body.systemConfigId, // Set systemConfig ID as per your requirement
                    });
    
                    // Push the promise to the array
                    contributionPromises.push(newContribute.save());
                });
    
                // Wait for all files and contributions to be saved
                await Promise.all(filePromises);
                await Promise.all(contributionPromises);
    
                // Optionally, you can clear the uploaded files from the server after saving them
                req.files.forEach((file) => {
                    fs.unlinkSync(file.path);
                });
    
                // Set session message and redirect
                req.session.message = {
                    type: "success",
                    message: "Files uploaded successfully"
                };
                res.redirect("/pageSubmit");
    
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error uploading files', error: err });
            }
        });
    },
    
    

    
}

module.exports = submissionController