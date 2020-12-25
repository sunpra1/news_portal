import Mongoose from 'mongoose';

const newsReactSchema = Mongoose.Schema({
    type: {
        type: String,
        uppercase: true,
        enum: ["HAPPY", "SAD", "SURPRISED", "HYSTERIC", "ANGRY"],
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

newsReactSchema.statics.fillable = ["type"];
const NewsReact = Mongoose.model("NewsReact", newsReactSchema);

export { newsReactSchema };
export default NewsReact;