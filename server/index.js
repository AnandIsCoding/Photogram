import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { urlencoded } from 'express';
import connectToDb from './config/database.js';
import dotenv from 'dotenv';
import fileupload from 'express-fileupload';

dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT ;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/temp/'
}));

// Cloudinary setup
import { cloudinaryConnect } from './config/cloudinary.js';
cloudinaryConnect();  // Correct way to call cloudinaryConnect

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:5173', // replace with your frontend URL
    credentials: true
  };
  app.use(cors(corsOptions));
  

// Connect to the database
connectToDb()
    .then(() => {
        console.log('Database connection established');
        app.listen(PORT, () => {
            console.log(`Server is listening at http://localhost:${PORT}/api/v1/`);
        });
    })
    .catch((error) => {
        console.log('Database connection failed');
        console.log(error);
    });

// Import all routers
import userRouter from './routes/user.route.js';
import postRouter from './routes/post.route.js';
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter)

// Catch-all for 404 errors
app.get('*', (req, res) => {
    res.status(404).send('404 Not Found');
});
