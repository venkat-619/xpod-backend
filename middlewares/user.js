const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const jwt = require('jsonwebtoken');

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    // header is for mobile sometimes comes from mobile thorugh headers
    const tokenW = req.cookies.token || req.header('Authorization');

    if(!tokenW) {
        return next( new customErrorClass(`Login first to access this page ...`, 401));
    }

    const token = tokenW.startsWith('Bearer ') ? tokenW.slice(7) : tokenW;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    next();
});