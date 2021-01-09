import Mongoose from 'mongoose';
import { commentSchema } from './Comment.js';
import { newsReactSchema } from './NewsReact.js';
import Summary from './Summary.js';

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

newsSchema.pre('save', async function (next) {
    if (this.isNew) { 
        const summary = await Summary.findById(1);
        summary.newsCount = summary.newsCount + 1;
        await summary.save();
    }
    next();
});

newsSchema.pre('remove', async function (next) {
    const summary = await Summary.findById(1);
    summary.newsCount = summary.newsCount - 1;
    await summary.save();
    next();
});

newsSchema.statics.fillable = ["title", "description", "category", "tags"];
export default Mongoose.model("News", newsSchema);