import Mongoose from 'mongoose';

const commentReactSchema = Mongoose.Schema({
    type: {
        type: String,
        enum: ["LIKE", "DISLIKE"],
        required: true
    },
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    comment: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: true
    }
}, {
    timestamps: true
});

export { commentReactSchema };