const express = require('express');
const router = express.Router();

const { signin, 
        signup, 
        logout, 
        getLoggedInDetails,
        getUserFriends,
        addRemoveFriend,
        getUserDetails,
        getUsers} = require('../controllers/userController');
const { isLoggedIn } = require('../middlewares/user');


// routes
router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').get(logout);
router.route('/userdashboard').get(isLoggedIn, getLoggedInDetails);
router.route('/userprofile/:id').get(isLoggedIn, getUserDetails);
router.route('/getusers').get(isLoggedIn, getUsers);

router.route('/getuserfriends').post(isLoggedIn, getUserFriends);
router.route('/addremovefriend').put(isLoggedIn, addRemoveFriend);

module.exports = router;