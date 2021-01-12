import Comment from "../Model/Comment.js";
import CommentReact from "../Model/CommentReact.js";
import News from "../Model/News.js";
import NewsReact from "../Model/NewsReact.js";
import User from "../Model/User.js";
import Validator from 'validator';

const TakeUserSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!User.fillable.includes(key))
            delete req.body[key];
        else
            if (key == "email" && req.user && req.user.email == req.body.email) {
                delete req.body.email;
            }
    });
    next();
};

const TakeNewsSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!News.fillable.includes(key))
            delete req.body[key];
        else
            if (key == "tags" && !(req.body.tags instanceof Array) && typeof req.body.tags == "string")
                req.body.tags = req.body.tags.split(",").map(tag => Validator.trim(tag).toLowerCase().replace(" ", "_"));
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
};

const TakeNewsReactSchemaFillable = (req, res, next) => {
    Object.keys(req.body).forEach(key => {
        if (!NewsReact.fillable.includes(key))
            delete req.body[key];
    });
    next();
};

export { TakeUserSchemaFillable, TakeNewsSchemaFillable, TakeCommentSchemaFillable, TakeCommentReactSchemaFillable, TakeNewsReactSchemaFillable };