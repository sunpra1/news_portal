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
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        validate: {
            validator: value => Validator.isEmail(value),
            message: prop => `${prop.value} is not valid email address`
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

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = Jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token: token });
    await user.save();

    return token;
};

userSchema.statics.isUnique = async (email) => {
    const user = await User.findOne({ email });
    return user ? false : true;
};

userSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.password;
    delete obj.tokens;

    return obj;
};

const User = Mongoose.model("User", userSchema);

export default User;