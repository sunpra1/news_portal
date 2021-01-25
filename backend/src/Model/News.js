import Mongoose from 'mongoose';
import { commentSchema } from './Comment.js';
import { imageSchema } from './Image.js';
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
    approved: {
        type: Boolean,
        default: false
    },
    images: [{
        type: imageSchema
    }],
    views: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    comments: [commentSchema],
    reacts: [newsReactSchema]
}, {
    timestamps: true
});

newsSchema.pre('save', async function (next) {
    if (this.isNew) {
        const summary = await Summary.findById(1);
        if (summary) { 
            summary.newsCount = summary.newsCount + 1;
            await summary.save();
        }
    }
    next();
});

newsSchema.pre('remove', async function (next) {
    const summary = await Summary.findById(1);
    if (summary) { 
        summary.newsCount = summary.newsCount - 1;
        await summary.save();
    }
    next();
});

newsSchema.statics.fillable = ["title", "description", "category", "tags"];
export default Mongoose.model("News", newsSchema);