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
    reacts: [commentReactSchema]
}, {
    timestamps: true
});

commentSchema.statics.fillable = ["comment", "approved"];

const Comment = Mongoose.model("Comment", commentSchema);

export { commentSchema };
export default Comment;
