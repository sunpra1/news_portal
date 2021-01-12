import Mongoose from 'mongoose';

const imageSchema = Mongoose.Schema({
    mimetype: {
        type: String,
        trim: true,
        required: [true, "Image MIME type is required"]
    },
    buffer: {
        type: Buffer,
        required: [true, "Image buffer is required"]
    }
});

export { imageSchema };
const Image = Mongoose.model('Image', imageSchema);
export default Image;