import Mongoose from 'mongoose';
import { imageSchema } from './Image.js';

const imageSliderSchema = Mongoose.Schema({
    image: {
        type: imageSchema,
        required: true
    },
    visibility: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const ImageSlider = Mongoose.model("ImageSlider", imageSliderSchema);
export default ImageSlider;