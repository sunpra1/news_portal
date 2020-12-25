import Mongoose from 'mongoose';

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

categorySchema.statics.isUnique = async category => {
    return await Category.findOne({ category: category.toUpperCase() }) ? false : true;
}

categorySchema.statics.fillable = ["category"];
const Category = Mongoose.model("Category", categorySchema);
export default Category;