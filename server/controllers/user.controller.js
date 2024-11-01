import { validateSignUpdata } from "../utils/validators.js"

import UserModel from "../models/user.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config()
// create signup controller
async function uploadFileToCloudinary(file, folder){
    const options = {folder}
    return await cloudinary.uploader.upload(file.tempFilePath, options)
}
function isFileTypeSupported(type, supportedTypes){
    return supportedTypes.includes(type)
}

export const SignupController = async (req, res) => {
    try {
        // Validate all data/credentials 
        const validationResult = validateSignUpdata(req);
        const { userName, email, password } = req.body;
        const file = req.files?.userImage; // Check if userImage exists
        const bio = req.body?.bio;
        const gender = req.body?.gender;

        // If validation fails return error
        if (validationResult) {
            return res.status(400).json({ error: validationResult });
        }

        // Check if user already present
        const userAlreadyregistered = await UserModel.findOne({ email });
        if (userAlreadyregistered) {
            return res.status(409).json({
                message: 'User already registered',
                success: false
            });
        }

        // File validation
        if (!file) {
            return res.status(400).json({
                message: 'User image is required',
                success: false
            });
        }

        const supportedTypes = ['jpg', 'jpeg', 'png'];
        const fileType = file.name.split('.').pop().toLowerCase();
        if (!isFileTypeSupported(fileType, supportedTypes)) {
            return res.status(400).json({
                message: 'Invalid file type, only jpg, jpeg, and png are allowed',
                success: false
            });
        }

        // If file type is supported
        const response = await uploadFileToCloudinary(file, "photogram");

        // Hash the password
        const encryptedPassword = await bcrypt.hash(password, 15);
        
        // Create new user
        await UserModel.create({
            userName,
            email,
            password: encryptedPassword,
            userImage: response.secure_url,
            bio,
            gender
        });

        return res.status(201).json({
            message: 'User created successfully',
            success: true
        });
    } catch (error) {
        console.log(error); // Log the error for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// create login controller
//1st check if user is available or not in the database using findOne , then check if password entered by user mathches with the user's password(which is in hash) if matches then login successfull

export const LoginController = async (req, res) => {
    const { email, password } = req.body
    try {
        //check if user is available with the entered email
        const userAvailable = await UserModel.findOne({email})
        if (!userAvailable) {
            return res.status(401).json({ message: 'Invalid Credentials', success: false })
        }
        //match password using bcrypt compare
        const passwordMatch = await bcrypt.compare(password, userAvailable.password)
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid credentials',
                success: false
            })
        }
        //generate JWT token, create a jwt token then add it to res.cookie, and send to user
        const token = jwt.sign({ _id: userAvailable._id }, process.env.PRIVATE_KEY, { expiresIn: '7d' })
        res.cookie('token', token, { httpOnly: true, sameSite: 'strict', expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }).json({
            message: `Welcome back Mr/Mrs ${userAvailable.userName}`,
            success: true
        })

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log(error)
    }
}


// create logout controller in res.cookie send token with value null, and expiry now
export const LogoutController = async (req, res) => {
    res.cookie('token', null, { maxAge: 0 }).json({ message: 'Logged out successfully', success: true });
}

export const getProfileController = async (req, res) => {
    try {
        const {userId} = req.params
        const userDetails = await UserModel.findById(userId).select('-password');
        if (!userDetails) {
            return res.status(404).json({
                message: 'User not Found',
                success: false
            })
        }
        return res.status(200).json({
            message: userDetails,
            success: true
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }

}

// create update profile controller
export const editProfileController = async (req, res) => {
    try {
        const userId = req.userId;
        const { userName, bio, gender, password } = req.body;
        const imageFile = req.files.userImage

        const supportedTypes = ['jpeg', 'png', 'jpg']
        const fileType = imageFile.name.split('.')[1].toLowerCase()
        if(!isFileTypeSupported(fileType, supportedTypes)){
            return res.status(400).json({message:'invalid file type', success:false})
        }
         //if file type supported thenupload to folder in cloudinary
         const response = await uploadFileToCloudinary(imageFile, "photogram")

        const encryptedPassword = await bcrypt.hash(password, 15)


        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).send('User Not Found');
        }

        // Update user fields
        if (bio) user.bio = bio;
        if (userName) user.userName = userName;
        if (gender) user.gender = gender;
        if(password) user.password = encryptedPassword
        if(imageFile) user.userImage = response.secure_url

        await user.save();

        return res.status(200).json({
            message: 'Profile updated successfully',
            response: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




//feed or suggestions
export const getSuggestionController = async (req, res) => {
    try {
        const { userId } = req.body;
        // Fetch suggested users with a different id, exclude password field
        const suggestedUsers = await UserModel.find({ _id: { $ne: userId } }).select('-password');
        
        if (!suggestedUsers || suggestedUsers.length === 0) {
            return res.status(404).json({
                message: 'No Suggestions Found',
            });
        }

        return res.status(200).json({ 
            message: 'Suggestions', 
            suggestedUsers 
        });
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error);
    }
};

// follow unfollow business logic controller

export const followUnfollow = async (req, res) => {
    try {
        const followSenderId = req.userId;    // Authenticated user ID (who is following)
        const followReceiverId = req.params.followReceiverId; // User to be followed

        console.log("Follow Sender ID:", followSenderId);
        console.log("Follow Receiver ID:", followReceiverId);

        // Prevent self-follow
        if (followSenderId.toString() === followReceiverId.toString()) {
            return res.status(400).json({
                message: 'You cannot follow yourself',
                success: false
            });
        }

        // Retrieve users
        const senderUser = await UserModel.findById(followSenderId);
        const receiverUser = await UserModel.findById(followReceiverId);

        // Check if users exist
        if (!senderUser || !receiverUser) {
            return res.status(404).json({
                message: 'User not found',
                success: false
            });
        }

        // Check if already following
        const isFollowing = senderUser.following.includes(followReceiverId);
        
        if (isFollowing) {
            // Unfollow logic
            senderUser.following = senderUser.following.filter(id => id.toString() !== followReceiverId);
            receiverUser.followers = receiverUser.followers.filter(id => id.toString() !== followSenderId);

            await senderUser.save();
            await receiverUser.save();

            return res.status(200).json({
                message: 'Unfollowed successfully',
                success: true
            });
        } else {
            // Follow logic
            senderUser.following.push(followReceiverId);
            receiverUser.followers.push(followSenderId);

            await senderUser.save();
            await receiverUser.save();

            return res.status(200).json({
                message: 'Followed successfully',
                success: true
            });
        }

    } catch (error) {
        console.error('Error in followUnfollow:', error);
        return res.status(500).json({
            message: 'An error occurred',
            success: false,
            error: error.message
        });
    }
};



