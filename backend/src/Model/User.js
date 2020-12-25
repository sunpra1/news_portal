import Mongoose from 'mongoose';
import Validator from 'validator';
import Jwt from 'jsonwebtoken';

const userSchema = Mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Full name is required."],
        trim: true
    },
    gender: {
        type: String,
        uppercase: true,
        enum: ["MALE", "FEMALE", "OTHER"]
    },
    dob: {
        type: Date
    },
    address: {
        type: String,
        trim: true,
        required: function () {
            return this.role == "OWNER";
        }
    },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: value => Validator.trim(value.toString()).length == 10 && Validator.isNumeric(Validator.trim(value.toString())),
            message: prop => {
                let message;
                if (Validator.trim(data.phone.toString()).length != 10) {
                    message = "Phone number must be 10 characters long";
                } else if (!Validator.isNumeric(Validator.trim(data.phone.toString()))) {
                    message = "Phone number must be numeric";
                }
                return message;
            }
        }
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        trim: true,
        validate: {
            validator: value => value.length >= 6,
            message: prop => `Password must be 6 characters long, provided ${prop.value.length} characters`
        }
    },
    image: {
        type: String,
        trim: true,
        default: null
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    role: {
        type: String,
        uppercase: true,
        enum: ["ADMIN", "AUTHOR", "USER"],
        default: "USER"
    },
    news: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "News"
    }]
}, {
    timestamps: true
});

userSchema.statics.fillable = ["fullName", "gender", "dob", "address", "phone", "password", "role"];

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = Jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    return token;
};

userSchema.statics.isUnique = async (phone) => {
    return await User.findOne({ phone }) ? false : true;
};

userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    delete obj.tokens;

    return obj;
};

const User = Mongoose.model("User", userSchema);

export default User;