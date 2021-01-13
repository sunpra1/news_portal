import Mongoose from 'mongoose';
import Summary from './Summary.js';

const categorySchema = Mongoose.Schema({
    category: {
        type: String,
        unique: true,
        uppercase: true,
        required: [true, "Category is required"],
        trim: true
    },
    news: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "News"
    }]
}, {
    timestamps: true
});

categorySchema.pre('save', async function (next) {
    if (this.isNew) {
        const summary = await Summary.findById(1);
        if (summary) { 
            summary.categoryCount = summary.categoryCount + 1;
            await summary.save();
        }
    }
    next();
});

categorySchema.pre('remove', async function (next) {
    const summary = await Summary.findById(1);
    if (summary) { 
        summary.categoryCount = summary.categoryCount - 1;
        await summary.save();
    }
    next();
});

categorySchema.statics.isUnique = async category => {
    return await Category.findOne({ category: category.toUpperCase() }) ? false : true;
};

categorySchema.statics.fillable = ["category"];
const Category = Mongoose.model("Category", categorySchema);
export default Category;