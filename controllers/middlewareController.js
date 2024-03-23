const jwt = require('jsonwebtoken');
const adminController = require('../controllers/adminController');

const middlewareController = {
    // verify token
    verifyToken: (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                throw new Error("Token not found");
            }
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, admin) => {
                if (err) {
                    res.status(403).json("Token not valid");
                } else {
                    req.admin = admin;
                    next();
                }
            });
        } catch (err) {
            res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'You must authenticate' }, title: 'Login Admin' });
        }
    },

    verifyUser: (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
        if (!token) {
            throw new Error("Token not found");
        }
        
        jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token not valid' });
            } else {
                // If you want to pass the decoded user data to the next middleware, you can attach it to the request object
                req.user = decoded;
                next();
            }
        });
        } catch(err) {
            res.render('users/loginUserSite', { message: { type: 'danger', message: 'You must authenticate' }, title: 'Log In User' });
        }
        
    },

    isAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.admin && (req.admin.id === req.params.id || req.admin.isAdmin)) {
                next();
            } else {
                res.status(403).json("You are not allowed to delete other");
            }
        });
    },
    
}

module.exports = middlewareController;