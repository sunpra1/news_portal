import Mongoose from 'mongoose';

const summarySchema = Mongoose.Schema({
    _id: {
        type: Number,
        default: 1
    },
    categoryCount: {
        type: Number,
        default: 0
    },
    newsCount: {
        type: Number,
        default: 0
    },
    totalUserCount: {
        type: Number,
        default: 0
    },
    adminUsers: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    authorUsers: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { _id: false });

const Summary = Mongoose.model("Summary", summarySchema);
export default Summary;