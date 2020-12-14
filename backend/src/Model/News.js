import Mongoose from 'mongoose';
import { commentSchema } from './Schema/Comment.js';
import { newsReactSchema } from './Schema/NewsReact.js';


const newsSchema = Mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    category: {
        type: Mongoose.Schema.Types.ObjectId,
        required: [true, "Category of the news is required"],
        ref: "Category"
    },
    author: {
        type: Mongoose.Schema.Types.ObjectId,
        required: [true, "Author of the news is required"],
        ref: "User"
    },
    tags: [{
        type: String,
        trim: true
    }],
    images: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    reacts: [newsReactSchema]
}, {
    timestamps: true
});

export default Mongoose.model("News", newsSchema);