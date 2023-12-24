const Post = require('../models/post');
const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const customErrorClass = require('../utils/customError');
const cloudinary = require('cloudinary');
const whereClause = require('../utils/whereClause');

// create
exports.createPost = BigPromise(async (req, res, next) => {
    
    const { description } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if(!description){
        return next(new customErrorClass('Please Enter post text', 400));
    }

    let file;
    let result;

    if(req.files != null) {

        file = req.files.postPhoto;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            transformation: [
                { quality: 100 }
            ],
            folder: "posts",
        })
    }

    const newPost = await Post.create({
        firstname: user.firstname,
        lastname: user.lastname,
        location: user.location,
        description,
        postImage: {
            id: req.files == null ? "" : result.public_id,
            secure_url: req.files == null ? "" : result.secure_url,
        },
        userImage: user.photo?.secure_url,
        userId,
        user: userId,
        likes: {},
        rePost: {},
        comments: [] 
    });

    res.status(200).json({
        success:true,
        message: "Post was Posted Successfully...",
        newPost
    });

});

// get all posts
exports.getAllPosts = BigPromise(async (req, res, next) => {
    // const posts = await Post.find().sort({ createdAt: -1 });
    const postObj = new whereClause(Post.find().sort({ createdAt: -1 }), req.query).pager(5);
    const posts = await postObj.base;

    const totalPosts = await Post.countDocuments();
    res.status(200).json({
        success: true,
        posts,
        totalPosts
    });
});

// get user posts
exports.getUserPosts = BigPromise(async (req, res, next) => {
    const userId = req.params.id;
    // const userPosts = await Post.find({userId}).sort({ createdAt: -1 });
    const totalPosts = await Post.find({userId}).countDocuments();
    const postObj = new whereClause(Post.find({userId}).sort({ createdAt: -1 }), req.query).pager(5);
    const userPosts = await postObj.base;

    res.status(200).json({
        success: true,
        userPosts,
        totalPosts
    })
});

// like post
exports.likePost = BigPromise(async (req, res, next) => {
    const {id} = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if(isLiked) {
        post.likes.delete(userId);
    } else {
        post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(id, 
        {likes: post.likes}, 
        {new: true}
    );

    res.status(200).json({
        success: true, 
        updatedPost
    });
});

// delete post
exports.deletePost = BigPromise(async (req, res, next) => {
    
    // get post from url
    const post = await Post.findById(req.params.id);

    if(!post){
        return next(new customErrorClass(`Post Not Found !!!`, 401));
    }

    // getting image id and deleting it in cloudinary
    const imageId = post.postImage.id;
    
    if(imageId) {
        await cloudinary.v2.uploader.destroy(imageId);
    }

    // deleting post
    await Post.deleteOne({_id: req.params.id});

    res.status(200).json({
        success: true,
        message: "Deleted post successfully...."
    });
});

exports.editPost = BigPromise(async (req, res, next) => {
    
    const {id} = req.params;
    const {description} = req.body;

    const post = await Post.findById(id);

    if(post.postImage.id){
        await cloudinary.v2.uploader.destroy(post.postImage.id);
    }

    let file;
    let result;

    if(req.files != null) {

        file = req.files.postPhoto;
        result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
            transformation: [
                { quality: 100 }
            ],
            folder: "posts",
        })
    }

    const updatedPost = await Post.findByIdAndUpdate(id, 
        {
            description,
            postImage: {
                id: req.files == null ? "" : result.public_id,
                secure_url: req.files == null ? "" : result.secure_url,
            },
        },
        {new: true}
    );

    res.status(200).json({
        success: true, 
        updatedPost
    });
    
});