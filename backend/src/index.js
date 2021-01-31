import Express from 'express';
import CORS from 'cors';
import ConnectMongoDb from './Database/ConnectMongoDB.js';
import userRouter from './Router/User.js';
import categoryRouter from './Router/Category.js';
import { getSimplifiedError } from './Utils/SimplifiedError.js';
import newsRouter from './Router/News.js';
import summaryRouter from './Router/Summary.js';
import imageSliderRouter from './Router/ImageSlider.js';
import messageRouter from './Router/Message.js';

const setupExpress = (hasConnectedToMongoose) => {
    if (hasConnectedToMongoose) {
        const app = new Express();
        const port = process.env.PORT;
        app.use(CORS("*"));
        app.use(Express.json());
        app.use(Express.urlencoded({ extended: false }));

        app.use("/users", userRouter);
        app.use("/categories", categoryRouter);
        app.use("/news", newsRouter);
        app.use("/summaries", summaryRouter);
        app.use("/sliderImages", imageSliderRouter);
        app.use("/messages", messageRouter);

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