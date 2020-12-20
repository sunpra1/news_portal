import News from "../Model/News.js";
import User from "../Model/User.js";

const TakeUserSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!User.fillable.includes(key))
            delete req.body[key];
    });
    next();
};

const TakeNewsSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!News.fillable.includes(key))
            delete req.body[key];
    });
    next();
};

export { TakeUserSchemaFillable, TakeNewsSchemaFillable };