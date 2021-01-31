import Mongoose from 'mongoose';
import Validator from 'validator';

const messageSchema = Mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name of the persion who is sending the message is required"]
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, "Email of the persion who is sending the message is required"],
        validate: {
            validator: value => Validator.isEmail(Validator.trim(value)),
            message: prop => `"${prop.value}" is not valid email address`
        }
    },
    subject: {
        type: String,
        required: [true, "Subject for which message is being sent is required"]
    },
    message: {
        type: String,
        required: [true, "Description for which message is being sent is required"]
    },
    replied: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

messageSchema.statics.fillable = ["name", "email", "subject", "message"];

const Message = Mongoose.model("Message", messageSchema);
export default Message;