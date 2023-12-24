const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'Please provide a first name'],
        minlength: [1, 'First Name should contain atleast one character'],
        maxlength: [40, 'Last Name should be under 40 characters']
    },
    lastname: {
        type: String,
        required: [true, 'Please provide a name'],
        minlength: [1, 'First Name should contain atleast one character'],
        maxlength: [40, 'Last Name should be under 40 characters']
    },
    email: {
        type: String,
        require: [true, 'Please Provide an email'],
        validate: [validator.isEmail, 'Please enter email in valid format'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'Please Provide an password'],
        minlength: [6, 'Password should atleast contain 6 chars'],
        select: false
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    },
    location: {
        type: String, 
        required: true
    },
    occupation: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please provide a Phone number'],
        minlength: [10, 'Please provide valid 10 digit phone number'],
        maxlength: [10, 'Please provide valid 10 digit phone number']
    },
    friends: {
        type: Array,
        default: [],
    },
    viewedProfile: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// encrypt password before save - hooks
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')){
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
})

// methods

// validating password
userSchema.methods.isValidatedPassword = async function(userSendPassword) {
    return await bcryptjs.compare(userSendPassword, this.password);
}

// create and return jwt token
userSchema.methods.getJwtToken = function() {
    return jwt.sign(
        {id: this._id},
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRY}
    );
}

module.exports = mongoose.model('User', userSchema);