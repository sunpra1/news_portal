import Mongoose from 'mongoose';

const commentReactSchema = Mongoose.Schema({
    type: {
        type: String,
        uppercase: true,
        enum: ["LIKE", "DISLIKE"],
        required: true
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
});

commentReactSchema.statics.fillable = ["type"];

const CommentReact = Mongoose.model("CommentReact", commentReactSchema);

export { commentReactSchema };
export default CommentReact;