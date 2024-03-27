const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const {User, roles} = require('../models/user'); // Đảm bảo đường dẫn đúng tới tệp model User
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');
const multer = require('multer');
const ContributionItem = require('../models/contributionItem');


let refreshTokens = [];

const homeController = {
    homePage: async (req, res) => {
        const userId = req.userId;
        const user = await User.findById(userId);
        res.render('users/index', {title: "Home Page", user: user});
    },

    loginedHome: async (req, res) => {
        const userId = req.userId; 
        const user = await User.findById(userId);
        const contribute = await ContributionItem.find().populate('faculty').populate('systemConfig');
        res.render('users/homePage', {title: "Home Page to Submit", user: user, 
        contribute: contribute });
    },

    loginUser: (req, res) => {
        res.render('users/loginUserSite', {title: "Log In"});
    },

    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            role: user.role,
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
            role: user.role,
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
            req.session.userLoggedIn = false;
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
                
                res.redirect('/homePage');
                
            }
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },

    
}

module.exports = homeController