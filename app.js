// dotenv
require('dotenv').config();

// express
const express = require('express');
const app = express();

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

// regular middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"
}));

// morgan middleware
app.use(morgan('common'));

// cors middleware
app.use(cors({
    origin: ['https://xpod.vercel.app', 'https://xpod-venkat-619.vercel.app', 'http://localhost:3000'],
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));

// import all routes here
const user = require('./routes/user');
const post = require('./routes/post');

// router middleware
app.use('/api/v1', user);
app.use('/api/v1', post);


module.exports = app;