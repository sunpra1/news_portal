import Mongoose from 'mongoose';

beforeAll(done => {
    Mongoose
        .connect(global.__MONGO_URI__, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        })
        .then(db => {
            done();
        })
        .catch(e => {
            console.error(e);
            process.exit(1);
        });
});

afterAll(done => {
    Mongoose
        .disconnect()
        .then(() => {
            done();
        });

});