const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const {User, roles} = require('../models/user');
const Faculty= require('../models/faculty');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');
const multer = require('multer');

// upload image
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function(req, file, cb) {
        // Generate a unique filename using the fieldname, current timestamp, and original filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '_' + uniqueSuffix + '_' + file.originalname);
    }
});

const upload = multer({
    storage: storage
}).single("image");



let refreshTokens = [];
const adminController = {
    
    
    loginAdmin: (req, res) => {
        res.render('administration/loginAdminSite', {title: 'Admin Login'});
    },
    registerAdmin: (req, res) => {
        res.render('administration/registerAdminSite', {title: 'Admin Reister'});
    },
    // Admin Register
    register: async(req, res) => {
        const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);

            // Create user
            const newAdmin = await new Admin({
                username: req.body.username,
                email: req.body.email,
                password: hashed,
            });

        try {
            

            // Save to DB
            await newAdmin.save();

            req.session.message = {
                type: "success",
                message: "User Added Successfully"
            };
            res.redirect("/loginAdmin");
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },
    //generate Access token
    dashboard: async(req, res) => {
        const admin = await Admin.findOne();
        res.render('administration/dashboard', {title: "Admin Dashboard", admin: admin});
    },
    generateAccessToken: (admin) => {
        return jwt.sign({
            id: admin.id,
            isAdmin: admin.isAdmin,
            token:admin
            
        },
            process.env.JWT_ACCESS_TOKEN,
            {
                expiresIn: "30d"
            }
        );
    },
    
    generateRefreshToken: (admin) => {
        return jwt.sign({
            id: admin.id,
            isAdmin: admin.isAdmin,
            token: admin,
        },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: "365d"
            }
        );
    },
    // Add faculty
    addFaculty: async (req, res) => {
        try {
            // Create a new faculty object
            const newFaculty = new Faculty({
                name: req.body.name
            });
    
            // Save the new faculty to the database
            await newFaculty.save();
    
            // Send a success response
            res.sendStatus(200);
        } catch (error) {
            console.error('Error adding faculty:', error);
            res.status(500).send('Failed to add faculty');
        }
    },
    listFaculty: async(req, res) => {
        try {
            const faculties = await Faculty.find();
            const admin = await Admin.findOne();
            res.render('administration/listFaculty', { title: 'Faculty', faculties: faculties, admin: admin });
        } catch (err) {
            res.status(500).json({ message: "Internal Server Error"});
        }
    },

    listUser: async(req, res) => {
        try {
            const admin = await Admin.findOne();
            const faculties = await Faculty.find({}, '_id name');
            res.render('administration/listUser', { title: 'Add New Users', admin: admin, roles: roles, faculties: faculties }); // Truyền biến title vào template
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },

    listStudents: async(req, res) => {
        try {
            const users = await User.find({role:"student"}).populate('faculty');
            const admin = await Admin.findOne(); // Giả sử bạn sử dụng Mongoose để lấy dữ liệu người dùng từ cơ sở dữ liệu
            res.render('administration/students', { title: 'Students', users: users, admin: admin }); // Truyền biến title vào template
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    listCoordinators: async(req, res) => {
        try {
            const users = await User.find({role:"coordinator"}).populate('faculty');
            const admin = await Admin.findOne(); // Giả sử bạn sử dụng Mongoose để lấy dữ liệu người dùng từ cơ sở dữ liệu
            res.render('administration/coordinators', { title: 'Marketing Coordinators', users: users, admin: admin }); // Truyền biến title vào template
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    listManagers: async(req, res) => {
        try {
            const users = await User.find({role:"manager"});
            const admin = await Admin.findOne(); // Giả sử bạn sử dụng Mongoose để lấy dữ liệu người dùng từ cơ sở dữ liệu
            res.render('administration/managers', { title: 'Marketing Manager', users: users, admin: admin }); // Truyền biến title vào template
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    
    addUser: async (req, res) => {
        // Sử dụng middleware upload
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message, type: "danger" });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(req.body.password, salt);
            try {
                // const faculty = req.body.faculty ? req.body.faculty : null;
                const faculty = await Faculty.findOne();
                
                if (!faculty) {
                    return res.status(404).json({ message: 'Faculty not found', type: 'danger' });
                }
                // Tạo một đối tượng user mới với dữ liệu từ request
                const newUser = await new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashed,
                    role: req.body.role,
                    faculty: faculty._id,
                    image: req.file ? req.file.filename : null, // Kiểm tra xem req.file có tồn tại không
                    phoneNumber: req.body.phoneNumber,
                    gender: req.body.gender,
                    city: req.body.city,
                });
    
                // Lưu user mới vào cơ sở dữ liệu
                await newUser.save();
    
                req.session.message = {
                    type: "success",
                    message: "User Added Successfully"
                };
                res.redirect("/listUser");
            } catch (err) {
                console.log(err);
                res.status(500).json({ message: err.message, type: "danger" });
            }
        });
    },
    
    

    edit: async (req, res) => {
        try {
            const admin = await Admin.findOne();
            const id = req.params.id;
            const user = await User.findById(id).exec();
            
            if (!user) {
                return res.redirect('/listUser');
            }
            res.render("administration/editUser", {
                title: "Edit User",
                user: user,
                admin: admin,
                id: id,
                roles: roles,
                faculties: faculties,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    updated: async (req, res) => {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(500).json({ message: err.message, type: "danger" });
            }
            const id = req.params.id;
            let new_image = "";
        
            if (req.file) {
                new_image = req.file.filename;
                try {
                    fs.unlinkSync("./uploads/" + req.body.old_image); // Sửa đường dẫn tới tệp ảnh cũ
                } catch (err) {
                    console.log(err);
                }
            } else {
                new_image = req.body.old_image;
            }
        
            let hashed = req.body.password; // Giữ nguyên mật khẩu nếu không có mật khẩu mới được nhập
            if (req.body.new_password) { // Nếu người dùng nhập mật khẩu mới
                const salt = await bcrypt.genSalt(10);
                hashed = await bcrypt.hash(req.body.new_password, salt); // Hash mật khẩu mới
            }
        
            try {
                const faculty = req.body.faculty ? req.body.faculty : null;
                // Cập nhật thông tin user
                const result = await User.findByIdAndUpdate(id, {
                    username: req.body.username,
                    email: req.body.email,
                    password: hashed, // Sử dụng hashed mật khẩu mới hoặc mật khẩu cũ
                    role: req.body.role,
                    faculty: faculty,
                    image: new_image, // Sử dụng tên tệp mới
                    phoneNumber: req.body.phoneNumber,
                    gender: req.body.gender,
                    city: req.body.city,
                }).exec();
        
                req.session.message = {
                    type: "success",
                    message: 'User Updated successfully',
                };
                res.redirect('/listUser');
            } catch (err) {
                console.error(err);
                res.json({ message: err.message, type: 'danger' });
            }
        })
    },
    delete: async (req, res) => {
        const id = req.params.id;
        try {
            const user = await User.findOneAndDelete({ _id: id }).exec();
            if (!user) {
                req.session.message = {
                    type: 'error',
                    message: 'User not found',
                };
                return res.redirect('back'); // Redirect back to the previous page
            }
            if (user.image !== '') {
                try {
                    fs.unlinkSync('./uploads/' + user.image);
                } catch (err) {
                    console.log(err);
                }
            }
            req.session.message = {
                type: 'info',
                message: 'User deleted Successfully!',
            };
            res.redirect('/student');
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    },
    
    login: async(req, res) => {
        try {
            const admin = await Admin.findOne({ email: req.body.email});
            if(!admin) {
                return res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'Invalid Email' }, title: 'Login Amin' });
            }

            const validPassword = await bcrypt.compare(
                req.body.password, admin.password
            );
            if(!validPassword){
                return res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'Wrong Password' }, title: 'Login Amin' });
            }
            if(admin && validPassword) {
                const accessToken = adminController.generateAccessToken(admin);
                const refreshToken = adminController.generateRefreshToken(admin);
                res.cookie("refreshToken", refreshToken);
                res.cookie("accessToken", accessToken);
                
                res.redirect('/dashboard');
                
            }
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },

    reqRefreshToken: async(req, res) => {
        const refreshToken = req.cookie.refreshToken;
        if(!refreshToken) return res.status(401).json("You are not authenticated");
        if(!refreshTokens.includes(refreshToken)) {
            return res.status(403).json("Refresh Token is not valid");
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, admin)=> {
            if(err){
                console.log(err);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            // create new accesstoken, refreshtoken,
            const newAccessToken = adminController.generateAccessToken(admin);
            const newRefreshToken = adminController.generateRefreshToken(admin);
            refreshTokens.push(newRefreshToken);
            res.cookie("refreshToken", newRefreshToken);

            res.status(200).json({accessToken: newAccessToken});
        })
    },

    logout: async (req, res) => {
        try {
            res.clearCookie("refreshToken");
            refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
            res.clearCookie("accessToken");
            res.redirect("/loginAdmin");
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },
    
    
    
};

module.exports = adminController;