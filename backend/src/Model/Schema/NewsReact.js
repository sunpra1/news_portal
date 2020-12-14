import Mongoose from 'mongoose';

const newsReactSchema = Mongoose.Schema({
    type: {
        type: String,
        enum: ["HAPPY", "SAD", "SURPRISED", "HYSTERIC", "ANGRY"],
        required: true
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
    }
}, {
    timestamps: true
});

export { newsReactSchema };