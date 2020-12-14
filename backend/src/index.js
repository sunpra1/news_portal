import Express from 'express';
import ConnectMongoDb from './Database/ConnectMongoDB.js';
import userRouter from './Router/User.js';
import categoryRouter from './Router/Category.js';
import { getSimplifiedError } from './Utils/SimplifiedError.js';

const setupExpress = (hasConnectedToMongoose) => {
    if (hasConnectedToMongoose) {
        const app = new Express();
        const port = process.env.PORT;
        app.use(Express.json());
        app.use(Express.urlencoded({ extended: false }));
        app.use('*/uploads', Express.static('public/uploads'));

        app.use("/users", userRouter);
        app.use("/categories", categoryRouter);

        app.use("*", function (req, res, next) {
            let err = new Error("Route Not Found");
            err.statusCode = 404;
            next(err);
        });

        app.use(function (err, req, res, next) {
            console.log(err);
            const simlifiedResponse = getSimplifiedError(err);
            res.status(simlifiedResponse.statusCode).send({ message: simlifiedResponse.message });
        });

        app.listen(port, () => {
            console.log(`Express server is up on port ${port}`);
        });
    }
};
ConnectMongoDb(setupExpress);