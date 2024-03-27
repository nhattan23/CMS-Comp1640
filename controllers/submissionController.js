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
const Terms = require('../models/terms');
const nodemailer = require('nodemailer');

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
        const allowedExtensions = ['.docs', '.doc', '.pdf', '.jpg', '.svg', '.png', '.docx'];
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
        try {
            const id = req.params.id;
            const userId = req.userId;

            const user = await User.findById(userId);
            const contribute = await ContributionItem.findById(id).populate('faculty').populate('systemConfig').exec();
            const contributionsWithSameItem = await Contribution.find({ contributionItem: contribute, users: user }).populate('file');
            const termsAndConditions = await Terms.findOne();


            if (!contribute) {
                // Không tìm thấy dữ liệu, render trang lỗi hoặc thông báo không tìm thấy
                res.status(404).json("404!");
            }
            if (!contributionsWithSameItem) {
                res.status(404).json("Not Found Contribution");
            }
            if (!termsAndConditions) {
                // Nếu không có điều khoản và điều kiện, trả về lỗi hoặc thông báo
                res.status(404).json("Terms and conditions not found!");
            }

            res.render('users/formSubmission', {
                title: "Submission Page",
                contribute: contribute,
                user: user,
                contributions: contributionsWithSameItem,
                termsAndConditions: termsAndConditions.content,
                message: req.session.message,
            });
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error in submissionSite:", error);
            res.status(500).json("Internal server");
        }
    },

    // uploadFile: async (req, res) => {
    //     uploads(req, res, async (err) => {
    //         if (err) {
    //             return res.status(500).json({ message: err.message, type: "danger" });
    //         }
    //         try {
    //             // Check if files are present
    //             if (!req.files || req.files.length === 0) {
    //                 return res.status(400).json({ message: 'No files uploaded' });
    //             }

    //             // Array to hold promises for file saving
    //             const filePromises = [];
    //             const contributionPromises = [];
    //             const userId = req.userId;
    //             const user = await User.findById(userId);
    //             const userEmail = user.email; 
    //             const id = req.params.id;
    //             const contributionItem = await ContributionItem.findById(id);
    //             const agreedToTerms = req.body.agreeToTerms;

    //             if (!agreedToTerms) {
    //                 // Nếu không đồng ý với điều khoản và điều kiện, trả về lỗi hoặc thông báo
    //                 res.status(400).json({ message: "You must agree to the terms and conditions" });
    //                 return;
    //             }

                
    //             // Iterate over files and save them
    //             req.files.forEach((file) => {
    //                 // Read file data
    //                 const fileData = fs.readFileSync(file.path);

    //                 // Create file object
    //                 const newFile = new FileModel({
    //                     filename: file.filename,
    //                     contentType: file.mimetype,
    //                     data: fileData,
    //                 });

    //                 // Push the promise to the array
    //                 filePromises.push(newFile.save());
    //                 // Create contribution object
    //                 const newContribute = new Contribution({
    //                     file: newFile._id, // Set status to "submitted" as per your requirement
    //                     users: userId,
    //                     contributionItem: contributionItem // Assuming you have user information available in req.user // Set systemConfig ID as per your requirement
    //                 });

    //                 // Push the promise to the array
    //                 contributionPromises.push(newContribute.save());
    //             });

    //             // Wait for all files and contributions to be saved
    //             await Promise.all(filePromises.concat(contributionPromises));

    //             // Optionally, you can clear the uploaded files from the server after saving them
    //             req.files.forEach((file) => {
    //                 fs.unlinkSync(file.path);
    //             });
    //             if (user.role === 'student') {
    //                 // Find coordinator of the faculty of the contributionItem
    //                 const coordinator = await findCoordinatorOfFaculty(contributionItem.faculty);

    //                 // Send email to the coordinator
    //                 await sendEmailToCoordinator(coordinator.email, contributionItem);
    //             }
    //             // Set session message and redirect
    //             req.session.message = {
    //                 type: "success",
    //                 message: "Files uploaded successfully"
    //             };
    //             res.redirect(`/pageSubmit/${id}`); // Change to backticks

    //         } catch (err) {
    //             console.error(err);
    //             res.status(500).json({ message: 'Error uploading files', error: err });
    //         }


    //         async function findCoordinatorOfFaculty(facultyId) {
    //             // Find the coordinator user based on the faculty ID
    //             const coordinator = await User.findOne({ faculty: facultyId, role: 'coordinator' });
    //             return coordinator;
    //         }

    //         // Method to send email to the coordinator
    //         async function sendEmailToCoordinator(email, contributionItem, userEmail) {
    //             // Create a transporter for Nodemailer
    //             const transporter = nodemailer.createTransport({
    //                 // Configure email sending (e.g., SMTP, Gmail, ...), see Nodemailer documentation for details
    //                 host: "smtp.gmail.com",
    //                 port: 587,
    //                 secure: false,
    //                 auth: {
    //                     user: "testEmailDemo2024@gmail.com",
    //                     pass: "cptx zzxz gkcm jpbb",
    //                   },
    //             });

    //             // Create email template
    //             const emailContent = `
    //                 <p>Dear Coordinator,</p>
    //                 <p>A new contribution has been submitted in your faculty:</p>
    //                 <ul>
    //                     <li>Contribution Item: ${contributionItem.title}</li>
    //                         <!-- Other information about the contributionItem you want to include -->
    //                 </ul>
    //                 <p>Best regards,</p>
    //                 <p>Your Application</p>
    //             `;
    //             // Configure email
    //             const mailOptions = {
    //                 from: `${userEmail}`,
    //                 to: email,
    //                 subject: 'New Contribution Submission',
    //                 html: emailContent
    //             };

    //             // Send email
    //             await transporter.sendMail(mailOptions);
    //         }

    //     });
    // },

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
    
                // Array to hold file saving tasks
                const fileSavingTasks = [];
                const userId = req.userId;
                const user = await User.findById(userId);
                const userEmail = user.email; 
                const id = req.params.id;
                const contributionItem = await ContributionItem.findById(id);
                const agreedToTerms = req.body.agreeToTerms;
    
                if (!agreedToTerms) {
                    return res.status(400).json({ message: "You must agree to the terms and conditions" });
                }
    
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
    
                    // Create contribution object
                    const newContribute = new Contribution({
                        file: newFile._id,
                        users: userId,
                        contributionItem: contributionItem._id
                    });
    
                    // Save file and contribution
                    fileSavingTasks.push(newFile.save());
                    fileSavingTasks.push(newContribute.save());
                });
    
                // Wait for all file saving tasks to be completed
                await Promise.all(fileSavingTasks);
    
                // Optionally, you can clear the uploaded files from the server after saving them
                req.files.forEach((file) => {
                    fs.unlinkSync(file.path);
                });
    
                if (user.role === 'student') {
                    // Find coordinator of the faculty of the contributionItem
                    const coordinator = await findCoordinatorOfFaculty(contributionItem.faculty);
    
                    // Send email to the coordinator
                    await sendEmailToCoordinator(coordinator.email, contributionItem, userEmail);
                }
    
                // Set session message and redirect
                req.session.message = {
                    type: "success",
                    message: "Files uploaded successfully"
                };  
                console.log(req.session.message);
                res.redirect(`/pageSubmit/${id}`);
            } catch (err) {
                console.error(err);
                res.status(500).json({ message: 'Error uploading files', error: err });
            }
            async function findCoordinatorOfFaculty(facultyId) {
                // Find the coordinator user based on the faculty ID
                const coordinator = await User.findOne({ faculty: facultyId, role: 'coordinator' });
                return coordinator;
            }

            // Method to send email to the coordinator
            async function sendEmailToCoordinator(email, contributionItem, userEmail) {
                // Create a transporter for Nodemailer
                const transporter = nodemailer.createTransport({
                    // Configure email sending (e.g., SMTP, Gmail, ...), see Nodemailer documentation for details
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: "testEmailDemo2024@gmail.com",
                        pass: "cptx zzxz gkcm jpbb",
                      },
                });

                // Create email template
                const emailContent = `
                    <p>Dear Coordinator,</p>
                    <p>A new contribution has been submitted in your faculty:</p>
                    <ul>
                        <li>Contribution Item: ${contributionItem.title}</li>
                            <!-- Other information about the contributionItem you want to include -->
                    </ul>
                    <p>Best regards,</p>
                    <p>Your Application</p>
                `;
                // Configure email
                const mailOptions = {
                    from: `${userEmail}`,
                    to: email,
                    subject: 'New Contribution Submission',
                    html: emailContent
                };

                // Send email
                await transporter.sendMail(mailOptions);
            }

        });
    },
}

module.exports = submissionController