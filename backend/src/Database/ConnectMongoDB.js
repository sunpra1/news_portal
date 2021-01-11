import Mongoose from 'mongoose';

export default async (callback) => {
    let hasConnectionEstablished = false;
    try {
        const mongoDBConnection = await Mongoose.connect(process.env.MONGODB_LIVE_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

        if (mongoDBConnection &&
            mongoDBConnection.connections &&
            mongoDBConnection.connections.length > 0 &&
            mongoDBConnection.connections[0]._hasOpened) {
            hasConnectionEstablished = true;
            console.log("MongolDB server is up and running");
        } else {
            const error = new Error("Unable to connect to MongolDB server.");
            error.statusCode = 401;
            throw (error);
        }
    } catch (e) {
        console.log(e.message);
    } finally {
        callback(hasConnectionEstablished);
    }
};