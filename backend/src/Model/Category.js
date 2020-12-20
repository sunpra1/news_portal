import Mongoose from 'mongoose';

const categorySchema = Mongoose.Schema({
    category: {
        type: String,
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

categorySchema.statics.fillable = ["category"];
export default Mongoose.model("Category", categorySchema);