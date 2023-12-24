const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const cloudinary = require('cloudinary');
const cookieToken = require('../utils/cookieToken');
const whereClause = require('../utils/whereClause');

exports.signup = BigPromise(async (req, res, next) => {

    console.log(req.body);
    const {firstname, lastname, email, password, location, occupation, phoneNumber} = req.body;

    if(!email || !password){
        return next(new customErrorClass('Email and password are required', 400));
    }

    let file;
    let result;

    if(req.files != null){
        
        file = req.files.photo;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            transformation: { quality: 90 },
            folder: "users",
            width: 150,
            crop: "scale",
        });
    }
    

    const user = await User.create({
        firstname,
        lastname,
        email,
        password,
        phoneNumber,
        photo : {
            id: req.files == null ? "" : result.public_id,
            secure_url: req.files == null ? "" : result.secure_url,
        },
        location,
        occupation,
        viewedProfile: Math.floor(Math.random() * 10000)
    });

    cookieToken(user, res);
});

exports.signin = BigPromise(async (req, res, next) => {
    const {email, password} = req.body;

    // checking for presence of email and password
    if(!email || !password){
        return next(new customErrorClass(`please provide email and password`, 400));
    }

    // getting user from database
    const user = await User.findOne({email}).select("+password");

    // checking if user exist or not
    if(!user){
        return next(new customErrorClass(`Email or password does not match or not exist`, 400));
    }

    // matching the password
    const isCorrectPassword = await user.isValidatedPassword(password);

    // if password doesn't match
    if(!isCorrectPassword){
        return next(new customErrorClass(`Email or password does not match or not exist`, 400));
    }

    // if everything goes good we send token
    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    // clearing token from  cookies
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        secure: true,
        sameSite: 'None',
        httpOnly: true
    });

    // success message
    res.status(200).json({
        success: true,
        message: "Logout Successfull !!!"
    });
});

exports.getLoggedInDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    // sending response here
    res.status(200).json({
        success: true,
        user
    });
});

exports.getUserDetails = BigPromise(async (req, res, next) => {
    
    const userId = req.params.id;
    const profileuser = await User.findById(userId);

    // sending response here
    res.status(200).json({
        success: true,
        profileuser
    });
});

exports.getUserFriends = BigPromise(async (req, res, next) => {
    
    const {userId} = req.body;
    const user = await User.findById(userId);

    const friends = await Promise.all(user.friends.map(id => User.findById(id)));
    const formattedFriends = friends.map(
        ({_id, firstname, lastname, occupation, location, photo}) => {
            return {
                _id, 
                firstname, 
                lastname, 
                occupation, 
                location, 
                userImage: photo.secure_url
            };
        });

    res.status(200).json({
        success: true,
        formattedFriends
    });

});
  
// add or remove friend
exports.addRemoveFriend = BigPromise(async (req, res, next) => {
    
    const {friendId} = req.body
    const userId = req.user.id;

    const user = await User.findById(userId);
    // const friend = await User.findById(friendId);

    if(user.friends.includes(friendId)){
        user.friends = user.friends.filter((id) => id !== friendId);
        // friend.friends = friend.friends.filter((id) => id !== userId);
    } else {
        user.friends.push(friendId);
        // friend.friends.push(userId);
    }

    await user.save();
    // await friend.save();

    const friends = await Promise.all(user.friends.map(id => User.findById(id)));
    const formattedFriends = friends.map(
        ({_id, firstname, lastname, occupation, location, photo}) => {
            return {
                _id, 
                firstname, 
                lastname, 
                occupation, 
                location, 
                userImage: photo?.secure_url
            };
        });

    res.status(200).json({
        success: true,
        formattedFriends
    });

});

exports.getUsers = BigPromise(async (req, res, next) => {
    
    const totalCountUser = await User.countDocuments();

    const userObj = new whereClause(User.find(), req.query).search();

    // since we have to find query we have to run as .base
    let users = await userObj.base;

    userObj.pager(5);
    users = await userObj.base.clone();

    const newusers = users.filter((user) => user._id.toString() !== req.user.id);

    // it gives number of users length we got after filtered
    const filterUserLength = newusers.length;

    res.status(200).json({
        success: true,
        newusers,
        filterUserLength,
        totalCountUser
    });
});
  