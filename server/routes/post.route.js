import express from 'express'
const postRouter = express.Router()
import isAuthenticated from '../middlewares/authenticateUser.js'
import { addPostController, getAllPostController, getUserPostController, likeController, dislikeController, addCommentController, getCommentsOfPost, deletePostController, bookmarkPostController } from '../controllers/post.controller.js'

// Define the routes
postRouter.post('/addpost', isAuthenticated, addPostController)
postRouter.get('allpost', isAuthenticated, getAllPostController)
postRouter.get('/userpost/all', isAuthenticated, getUserPostController)
postRouter.get('/:id/like', isAuthenticated, likeController)
postRouter.get('/:id/dislike', isAuthenticated, dislikeController)
postRouter.post(':id/addcomment', isAuthenticated, addCommentController)
postRouter.get('/:id/comment/all', isAuthenticated, getCommentsOfPost)
postRouter.delete('/delete/:id', isAuthenticated, deletePostController)
postRouter.post('/:id/bookmark', isAuthenticated, bookmarkPostController)

export default postRouter