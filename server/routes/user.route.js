import express from 'express';
const userRouter = express.Router();
import {editProfileController,  followUnfollow, getProfileController, getSuggestionController, LoginController, LogoutController, SignupController } from '../controllers/user.controller.js'; 
import isAuthenticated from '../middlewares/authenticateUser.js';


// Define the routes
userRouter.post('/signup', SignupController);
userRouter.post('/login', LoginController)
userRouter.post('/logout', LogoutController)
userRouter.get('/profile/:userId',isAuthenticated, getProfileController)
userRouter.patch('/profile/edit', isAuthenticated, editProfileController)
userRouter.get('/suggestions',isAuthenticated, getSuggestionController)
userRouter.post('/followorunfollow/:followReceiverId',isAuthenticated, followUnfollow)


export default userRouter;


