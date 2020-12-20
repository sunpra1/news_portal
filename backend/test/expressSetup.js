import Request from 'supertest';
import Express from 'express';
import UserRouter from '../src/Router/User.js';
import CategoryRouter from '../src/Router/Category.js';
import { getSimplifiedError } from '../src/Utils/SimplifiedError.js';
import newsRouter from '../src/Router/News.js';

const app = Express();
app.use(Express.json());
app.use(Express.urlencoded({ extended: false }));
app.use("/categories", CategoryRouter);
app.use("/users", UserRouter);
app.use("/news", newsRouter)

app.use("*", function (req, res, next) {
    let err = new Error("Route Not Found");
    err.statusCode = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    // console.log(err.message);
    const simlifiedResponse = getSimplifiedError(err);
    res.status(simlifiedResponse.statusCode).send({ message: simlifiedResponse.message });
});

export default Request(app);