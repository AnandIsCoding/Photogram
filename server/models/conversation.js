import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }],
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Message'
    }]
},{timestamps:true})

const ConversationModel = mongoose.model('Conversation',conversationSchema)
export default ConversationModel
