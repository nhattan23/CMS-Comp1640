const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
// import Router

const adminRouter = require('./routes/adminRouter');
const homeRouter = require('./routes/homeRouter');

const { JsonWebTokenError } = require('jsonwebtoken');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'));

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true,} );
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to database'));

// middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}))

app.use((req, res, next) => {
    res.locals.message  = req.session.message;
    delete req.session.message;
    next();
})
app.use(cors());
app.use(cookieParser());
app.use(express.json());


app.set("view engine", "ejs");

//Routes

app.use("", adminRouter);
app.use("", homeRouter);




app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});