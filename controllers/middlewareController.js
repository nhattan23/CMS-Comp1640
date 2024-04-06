const jwt = require('jsonwebtoken');


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
                        req.adminId = decodedToken.id;
                        next();
                    } else {
                        // Nếu không phải là admin, chuyển hướng hoặc trả về lỗi
                        res.render('users/loginUserSite', { message: { type: 'danger', message: 'You must authenticate as an admin' }, title: 'Login Admin' });
                    }
                }
            });
        } catch (err) {
            res.render('users/loginUserSite', { message: { type: 'danger', message: 'You must authenticate' }, title: 'Login Admin' });
        }
    },
    

    verifyUser: (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                return res.status(403).json({ message: 'Token not found' });
            }
    
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decodedToken) => {
                if (err) {
                    return res.status(403).json({ message: 'Token not valid' });
                } else {
                    const userRole = decodedToken.role;
                    if (userRole === "student" || userRole === "manager" || userRole === "coordinator" || userRole === "guest") {
                        req.user = decodedToken;
                        req.userId = decodedToken.id;
                        next();
                    } else {
                        res.render('users/loginUserSite', { message: { type: 'danger', message: 'You are not Allowed' }, title: 'Log In' });
                    }
                }
            });
        } catch (err) {
            return res.render('users/loginUserSite', { message: { type: 'danger', message: 'You Must Authenticated' }, title: 'Log In' });
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
                
                req.session.message = {
                    type: 'info',
                    message: 'You are already logged in.'
                };
                return res.redirect('/homePage');
            } else {
                // Nếu không có token, cho phép người dùng truy cập vào trang đăng nhập
                next();
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    allowOnlyGuest: async (req, res, next) => {
        try {
            const token = req.cookies.accessToken;
            if (!token) {
                return res.status(403).json({ message: 'Token not found' });
            }
    
            jwt.verify(token, process.env.JWT_ACCESS_TOKEN, async (err, decodedToken) => {
                if (err) {
                    return res.status(403).json({ message: 'Token not valid' });
                } else {
                    const userId = decodedToken.id;
                    // Kiểm tra xem người dùng có phải là khách hàng không
                    const guest = await Guest.findById(userId);
                    if (!guest) {
                        return res.status(403).json({ message: 'You are not allowed to access this resource' });
                    }
                    req.user = decodedToken;
                    req.userId = userId;
                    next();
                }
            });
        } catch (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
    
    
}

module.exports = middlewareController;