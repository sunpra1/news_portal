import Comment from "../Model/Comment.js";
import CommentReact from "../Model/CommentReact.js";
import News from "../Model/News.js";
import NewsReact from "../Model/NewsReact.js";
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

const TakeCommentSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!Comment.fillable.includes(key))
            delete req.body[key];
    });
    next();
};

const TakeCommentReactSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!CommentReact.fillable.includes(key))
            delete req.body[key];
    });
    next();
}

const TakeNewsReactSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!NewsReact.fillable.includes(key))
            delete req.body[key];
    });
    next();
}

export { TakeUserSchemaFillable, TakeNewsSchemaFillable, TakeCommentSchemaFillable, TakeCommentReactSchemaFillable, TakeNewsReactSchemaFillable };