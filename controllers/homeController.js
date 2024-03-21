const bcrypt=require('bcrypt');
const Admin = require('../models/admin');
const {User, roles, faculties} = require('../models/user'); // Đảm bảo đường dẫn đúng tới tệp model User
const express = require('express');
const jwt = require('jsonwebtoken');
const { Cookie } = require('express-session');
const multer = require('multer');

const homeController = {
    homePage: (req, res) => {
        res.render('users/index', {title: "Home Page"});
    },
}

module.exports = homeController