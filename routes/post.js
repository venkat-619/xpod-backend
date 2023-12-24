const express = require('express');
const router = express.Router();

const { createPost, 
        getAllPosts, 
        getUserPosts, 
        likePost,
        deletePost,
        editPost} = require('../controllers/postController');

const { isLoggedIn } = require('../middlewares/user');

router.route('/createpost').post(isLoggedIn, createPost);
router.route('/getallposts').get(isLoggedIn, getAllPosts);
router.route('/getuserposts/:id').get(isLoggedIn, getUserPosts);

router.route('/likepost/:id').post(isLoggedIn, likePost);
router.route('/deletepost/:id').delete(isLoggedIn, deletePost);
router.route('/editpost/:id').put(isLoggedIn, editPost);


module.exports = router;