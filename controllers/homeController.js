const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const {User, roles} = require('../models/user'); // Đảm bảo đường dẫn đúng tới tệp model User
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');
const multer = require('multer');

let refreshTokens = [];
const homeController = {
    homePage: (req, res) => {
        res.render('users/index', {title: "Home Page"});
    },

    loginUser: (req, res) => {
        res.render('users/loginUserSite', {title: "Log In"});
    },

    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            token: user
        },
            process.env.JWT_ACCESS_TOKEN,
            {
                expiresIn: "30d"
            }
        );
    },
    
    generateRefreshToken: (user) => {
        return jwt.sign({
            id: user.id,
            token: user,
        },
            process.env.JWT_REFRESH_KEY,
            {
                expiresIn: "365d"
            }
        );
    },

    login: async(req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email});
            if(!user) {
                return res.render('users/loginUserSite', { message: { type: 'danger', message: 'Invalid Email' }, title: 'Log In' });
            }

            const validPassword = await bcrypt.compare(
                req.body.password, user.password
            );
            if(!validPassword){
                return res.render('users/loginUserSite', { message: { type: 'danger', message: 'Wrong Password' }, title: 'Log In' });
            }
            if(user && validPassword) {
                const accessToken = homeController.generateAccessToken(user);
                const refreshToken = homeController.generateRefreshToken(user);
                res.cookie("refreshToken", refreshToken);
                res.cookie("accessToken", accessToken);
                
                res.redirect('/pageSubmit');
                
            }
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },

    
}

module.exports = homeController