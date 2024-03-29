import Mongoose from 'mongoose';
import Validator from 'validator';
import Jwt from 'jsonwebtoken';
import Summary from './Summary.js';
import { imageSchema } from './Image.js';

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
        trim: true
    },
    phone: {
        type: Number,
        required: true,
        validate: {
            validator: value => Validator.trim(value.toString()).length == 10 && Validator.isNumeric(Validator.trim(value.toString())),
            message: prop => {
                let message;
                if (Validator.trim(prop.value.toString()).length != 10) {
                    message = "Phone number must be 10 characters long";
                } else if (!Validator.isNumeric(Validator.trim(prop.value.toString()))) {
                    message = "Phone number must be numeric";
                } else { 
                    message = "Phone number validation failed";
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
        type: imageSchema
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
    }],
    facebook: {
        type: String,
        trim: true,
        validate: {
            validator: value => Validator.isURL(value),
            message: prop => `${prop.value} is not a valid URL for facebook`
        }
    },
    instagram: {
        type: String,
        trim: true,
        validate: {
            validator: value => Validator.isURL(value),
            message: prop => `${prop.value} is not a valid URL for instagram`
        }
    },
    twitter: {
        type: String,
        trim: true,
        validate: {
            validator: value => Validator.isURL(value),
            message: prop => `${prop.value} is not a valid URL for twitter`
        }
    },
    about: {
        type: String,
        trim: true,
        minlength: 50
    }
}, {
    timestamps: true
});

userSchema.statics.fillable = ["fullName", "gender", "dob", "address", "phone", "password", "role", "facebook", "instagram", "twitter", "about"];

userSchema.pre('save', async function (next) {

    const user = this;
    const summary = await Summary.findById(1);

    if (summary) {
        switch (user.role) {
            case "ADMIN": {
                if (this.isNew) {
                    summary.adminUsers.push(user.id);
                    summary.totalUserCount = summary.totalUserCount + 1;
                } else {
                    if (summary.adminUsers.findIndex(userID => userID.toString() == user.id.toString()) < 0) summary.adminUsers.push(user.id);

                    if (summary.authorUsers.findIndex(userID => userID.toString() == user.id.toString()) > -1) summary.authorUsers = summary.authorUsers.filter(userID => userID.toString() != user.id.toString());
                }
                break;
            }

            case "AUTHOR": {
                if (this.isNew) {
                    summary.authorUsers.push(user.id);
                    summary.totalUserCount = summary.totalUserCount + 1;
                } else {
                    if (summary.authorUsers.findIndex(userID => userID.toString() == user.id.toString()) < 0) summary.authorUsers.push(user.id);

                    if (summary.adminUsers.findIndex(userID => userID.toString() == user.id.toString()) > -1) summary.adminUsers = summary.adminUsers.filter(userID => userID.toString() != user.id.toString());
                }
                break;
            }

            case "USER": {
                if (this.isNew) {
                    summary.totalUserCount = summary.totalUserCount + 1;
                } else {
                    if (summary.adminUsers.findIndex(userID => userID.toString() == user.id.toString()) > -1) summary.adminUsers = summary.adminUsers.filter(userID => userID.toString() != user.id.toString());

                    if (summary.authorUsers.findIndex(userID => userID.toString() == user.id.toString()) > -1) summary.authorUsers = summary.authorUsers.filter(userID => userID.toString() != user.id.toString());
                }
                break;
            }
        }
        await summary.save();
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    const summary = await Summary.findById(1);

    if (summary) { 
        switch (user.type) {
            case "ADMIN": {
                summary.adminUsers = summary.adminUsers.filter(userID => userID.toString() != user.id.toString());
                summary.totalUserCount = summary.totalUserCount - 1;
                break;
            }

            case "AUTHOR": {
                summary.authorUsers = summary.authorUsers.filter(userID => userID.toString() != user.id.toString());
                summary.totalUserCount = summary.totalUserCount - 1;
                break;
            }

            case "USER": {
                summary.totalUserCount = summary.totalUserCount - 1;
                break;
            }
        }
        await summary.save();
    }
    next();
});


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