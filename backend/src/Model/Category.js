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

export default Mongoose.model("Category", categorySchema);