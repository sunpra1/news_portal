import Mongoose from 'mongoose';
import { commentReactSchema } from './CommentReact.js';

const commentSchema = Mongoose.Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    news: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "News",
        required: true
    },
    reacts: [commentReactSchema]
}, {
    timestamps: true
});

export { commentSchema };