import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    message:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const MessageModel = mongoose.Model('Message', messageSchema)
export default MessageModel

