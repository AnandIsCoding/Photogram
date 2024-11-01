import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()
const DATABASE_URI = process.env.DATABASE_URI

// Connect to MongoDB
const connectToDb = async() =>{
    await mongoose.connect(DATABASE_URI)
}
export default connectToDb;