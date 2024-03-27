const jwt = require('jsonwebtoken');
const adminController = require('../controllers/adminController');
const User = require('../models/user');

const middlewareController = {
    // verify token
    verifyToken: (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                throw new Error("Token not found");
            }
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decodedToken) => {
                if (err) {
                    res.status(403).json("Token not valid");
                } else {
                    // Kiểm tra loại tài khoản từ dữ liệu giải mã trong token
                    const isAdmin = decodedToken.isAdmin;
                    if (isAdmin) {
                        // Nếu là admin, gán req.admin và tiếp tục
                        req.admin = decodedToken;
                        next();
                    } else {
                        // Nếu không phải là admin, chuyển hướng hoặc trả về lỗi
                        res.render('administration/loginAdminSite', { message: { type: 'danger', message: 'You must authenticate as an admin' }, title: 'Login Admin' });
                    }
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

        jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({ message: 'Token not valid' });
            } else {
                const user = decodedToken.role;
                if (user === "student"|| user === "manager" || user === "coordinator") {
                    req.user = decodedToken;
                    req.userId = decodedToken.id;
                    next();
                } else {
                    // Người dùng không phải là admin
                    res.render('users/loginUserSite', { message: { type: 'danger', message: 'You are not Student' }, title: 'Log In User' });
                }
            }
        });
        } catch(err) {
            res.render('users/loginUserSite', { message: { type: 'danger', message: 'You must authenticate' }, title: 'Log In User' });
        }
        
    },

    checkLogOutAdmin: (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (token) {
                // Nếu tồn tại token, tức là người dùng đã đăng nhập, chuyển hướng họ đến trang chính đã đăng nhập hoặc trang dành cho người dùng đã đăng nhập
                return res.redirect('/dashboard'); // Thay đổi đường dẫn tùy thuộc vào trang chính đã đăng nhập của bạn
            } else {
                // Nếu không có token, cho phép người dùng truy cập vào trang đăng nhập
                next();
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error("Error in checkLogout middleware:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    checkLogOutUser: async (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (token) {
                const user = await User.findOne({ accessToken: token });
                if (user) {
                // Gán thông tin người dùng cho đối tượng req
                req.user = user;
                // Nếu tồn tại token và người dùng, chuyển hướng người dùng đến trang chính đã đăng nhập
                return res.redirect('/homePage');
            }
                // Nếu tồn tại token, tức là người dùng đã đăng nhập, chuyển hướng họ đến trang chính đã đăng nhập hoặc trang dành cho người dùng đã đăng nhập
                return res.redirect('/homePage'); // Thay đổi đường dẫn tùy thuộc vào trang chính đã đăng nhập của bạn
            } else {
                // Nếu không có token, cho phép người dùng truy cập vào trang đăng nhập
                next();
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    isAdmin: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.admin && (req.admin.id === req.params.id || req.admin.isAdmin)) {
                next();
            } else {
                res.status(403).json("You are not Administrtion");
            }
        });
    },
    
}

module.exports = middlewareController;