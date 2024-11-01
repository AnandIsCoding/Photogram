import mongoose from 'mongoose'
const commentSchema = mongoose.Schema({
    text:{
        type:String,
        required:true,
        minlength:1
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        required:true
    }
},{
    timestamps:true
})

const CommentModel = mongoose.model('Comment',commentSchema)
export default CommentModel