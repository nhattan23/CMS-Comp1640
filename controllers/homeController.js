const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const {User, roles} = require('../models/user'); // Đảm bảo đường dẫn đúng tới tệp model User
const jwt = require('jsonwebtoken');



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
        
        res.render('users/homePage', {title: "Home Page to Submit", user: user});
    },

    loginUser: (req, res) => {
        res.render('users/loginUserSite', {title: "Log In"});
    },

    generateAccessToken: (user) => {
        return jwt.sign({
            id: user.id,
            role: user.role ? user.role : null,
            token: user,
            isAdmin: user.isAdmin ? user.isAdmin : null,
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
            role: user.role ? user.role : null,
            token: user,
            isAdmin: user.isAdmin ? user.isAdmin : null,
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
            const admin = await Admin.findOne({ email: req.body.email });

            if(!user && !admin && !guest) {
                return res.render('users/loginUserSite', { message: { type: 'danger', message: 'Invalid Email' }, title: 'Log In' });
            }

            let validPassword = false;
            let loggedInUser = null;

            if (user) {
                validPassword = await bcrypt.compare(req.body.password, user.password);
                loggedInUser = user;
            } else if (admin) {
                validPassword = await bcrypt.compare(req.body.password, admin.password);
                loggedInUser = admin;
            } 

            if(!validPassword){
                return res.render('users/loginUserSite', { message: { type: 'danger', message: 'Wrong Password' }, title: 'Log In' });
            } 
              

            if (loggedInUser) {
                const accessToken = homeController.generateAccessToken(loggedInUser);
                const refreshToken = homeController.generateRefreshToken(loggedInUser);
                res.cookie("refreshToken", refreshToken);
                res.cookie("accessToken", accessToken);
    
                if (user) {
                    res.redirect('/homePage');
                } else if (admin) {
                    res.redirect('/dashboard');
                } 
            }
        } catch(err) {
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie("refreshToken");
            refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
            res.clearCookie("accessToken");
            res.redirect("/loginUser");
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err.message, type: "danger" });
        }
    },
    
}

module.exports = homeController