import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    caption:{
        type:String,
        default:'',
    },
    postImage:{
        type:String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }]
},{
    timestamps:true
})


const PostModel = mongoose.model('Post', postSchema)
export default PostModel