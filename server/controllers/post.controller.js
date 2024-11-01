import { validateSignUpdata } from "../utils/validators.js";
import UserModel from "../models/user.js";
import PostModel from "../models/post.js";
import CommentModel from "../models/comment.js";

import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Methods to upload files to Cloudinary
async function uploadFileToCloudinary(file, folder) {
  const options = { folder };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

// Controllers

export const addPostController = async (req, res) => {
  try {
    const authorId = req.userId;
    const caption = req.body.caption;
    const postImagetobeuploaded = req.files.postImage;

    // Check if user exists
    const user = await UserModel.findById(authorId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (!postImagetobeuploaded) {
      return res.status(400).json({ message: "Please upload an image or video", success: false });
    }

    // File validation
    const supportedTypes = ["jpg", "jpeg", "png"];
    const fileType = postImagetobeuploaded.name.split(".").pop().toLowerCase();
    if (!isFileTypeSupported(fileType, supportedTypes)) {
      return res.status(400).json({ message: "Invalid file type; only jpg, jpeg, and png are allowed", success: false });
    }

    // Upload file to Cloudinary
    const response = await uploadFileToCloudinary(postImagetobeuploaded, "photogram");
    const post = await PostModel.create({
      caption,
      postImage: response.secure_url,
      author: authorId,
    });
    user.posts.push(post._id);
    await user.save();

    await post.populate({ path: "author", select: "-password" }).execPopulate();
    return res.status(200).json({ message: "Post added successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const getAllPostController = async (req, res) => {
  try {
    const allposts = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "userName userImage" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "userName userImage" },
      });
    return res.status(200).json({ message: "All posts", success: true, allposts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const getUserPostController = async (req, res) => {
  try {
    const posterId = req.userId;
    const allPosts = await PostModel.find({ author: posterId })
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "userName userImage" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "userName userImage" },
      });
    return res.status(200).json({ message: "User posts", success: true, allPosts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const likeController = async (req, res) => {
  try {
    const likerId = req.userId;
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }
    await post.updateOne({ $addToSet: { likes: likerId } });
    return res.status(200).json({ message: "Post liked successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const dislikeController = async (req, res) => {
  try {
    const likerId = req.userId;
    const postId = req.params.id;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    await post.updateOne({ $pull: { likes: likerId } });
    return res.status(200).json({ message: "Post disliked successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const addCommentController = async (req, res) => {
  try {
    const commenterId = req.userId;
    const postId = req.params.id;
    const text = req.body.text;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });
    if (!text) return res.status(400).json({ message: "Comment text is required", success: false });

    const comment = await CommentModel.create({ text, author: commenterId, post: postId });
    post.comments.push(comment._id);
    await post.save();
    return res.status(201).json({ message: "Comment added successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await CommentModel.find({ post: postId }).populate("author", "userName userImage");
    if (!comments) return res.status(404).json({ message: "Comments not found", success: false });

    return res.status(200).json({ message: "Comments of post", success: true, comments });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.userId;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    if (post.author.toString() !== authorId) return res.status(403).json({ message: "Unauthorized", success: false });

    await CommentModel.deleteMany({ post: postId });
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};

export const bookmarkPostController = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId;
    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found", success: false });

    const user = await UserModel.findById(userId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      return res.status(200).json({ message: "Post removed from bookmarks", success: true });
    } else {
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      return res.status(200).json({ message: "Post bookmarked", success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "An error occurred", success: false });
  }
};
