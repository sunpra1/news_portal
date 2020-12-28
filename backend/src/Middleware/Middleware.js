import Jwt from 'jsonwebtoken';
import Validator from 'validator';
import News from '../Model/News.js';
import User from '../Model/User.js';
import { deleteCommentData, deleteNewsData, updateCommentData, updateNewsData } from '../Utils/Validate.js';

const Auth = async (req, res, next) => {
    try {
        const token = req.header("authorization");
        if (token) {
            const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);
            let user = await User.findOne({ _id: decodedToken, "tokens.token": token });
            if (user) {
                req.user = user;
                req.token = token;
                next();
            } else {
                const error = new Error("Authorization failed");
                error.statusCode = 401;
                next(error);
            }
        } else {
            const error = new Error("Authorization failed");
            error.statusCode = 401;
            next(error);
        }
    } catch (e) {
        next(e);
    }
};

const IfAuth = async (req, res, next) => {
    try {
        const token = req.header("authorization");
        if (token) {
            const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);
            let user = await User.findOne({ _id: decodedToken, "tokens.token": token });
            if (user) {
                req.user = user;
                req.token = token;
            }
        }
        next();
    } catch (e) {
        next(e);
    }
};

const AdminUser = (req, res, next) => {
    Auth(req, res, error => {
        if (error) {
            next(error);
        } else {
            try {
                if (req.user.role === "ADMIN") {
                    next();
                } else {
                    const error = new Error("You don't have enough privilage to perform this action");
                    error.statusCode = 401;
                    next(error);
                }
            } catch (e) {
                next(e);
            }

        }
    });
};

const PostNews = (req, res, next) => {
    Auth(req, res, error => {
        if (error) {
            next(error);
        } else {
            try {
                if (req.user.role === "ADMIN" || req.user.role === "AUTHOR") {
                    next();
                } else {
                    const error = new Error("You don't have enough privilage to perform this action");
                    error.statusCode = 401;
                    next(error);
                }
            } catch (e) {
                next(e);
            }
        }
    });
};

const UpdateNews = (req, res, next) => {
    Auth(req, res, async error => {
        if (error) {
            next(error);
        } else {
            try {
                const validationErrors = updateNewsData({ ...req.params, ...req.body });
                if (Object.keys(validationErrors).length == 0) {
                    const news = await News.findById(req.params.newsID);
                    if (news) {
                        if (req.user.role === "ADMIN") {
                            req.news = news;
                            next();
                        } else {
                            if (req.user.role === "AUTHOR" && news.author.id === req.user.id) {
                                req.news = news;
                                next();
                            } else {
                                const error = new Error("You don't have enough privilage to perform this action");
                                error.statusCode = 401;
                                next(error);
                            }
                        }
                    } else {
                        const error = new Error("News with id: " + req.params.newsID + " not found");
                        error.statusCode = 400;
                        next(error);
                    }
                } else {
                    res.status(400).send({ message: validationErrors });
                }
            } catch (e) {
                next(e);
            }
        }
    });
};


const DeleteNews = (req, res, next) => {
    Auth(req, res, async error => {
        if (error) {
            next(error);
        } else {
            try {
                const validationErrors = deleteNewsData(req.params);
                if (Object.keys(validationErrors).length == 0) {
                    const news = await News.findById(req.params.newsID);
                    if (news) {
                        if (req.user.role === "ADMIN") {
                            req.news = news;
                            next();
                        } else {
                            if (req.user.role === "AUTHOR" && news.author.id === req.user.id) {
                                req.news = news;
                                next();
                            } else {
                                const error = new Error("You don't have enough privilage to perform this action");
                                error.statusCode = 401;
                                next(error);
                            }
                        }
                    } else {
                        const error = new Error("News with id: " + req.params.newsID + " not found");
                        error.statusCode = 400;
                        next(error);
                    }
                } else {
                    res.status(400).send({ message: validationErrors });
                }
            } catch (e) {
                next(e);
            }
        }
    });
};

const UpdateComment = (req, res, next) => {
    Auth(req, res, async error => {
        if (error) {
            next(error);
        } else {
            try {
                const validationErrors = updateCommentData({ ...req.params, ...req.body });
                if (Object.keys(validationErrors).length == 0) {
                    const news = await News.findById(req.params.newsID);
                    if (news) {
                        const comment = news.comments.id(req.params.commentID);
                        if (comment) {
                            if (comment.user.toString() == req.user.id.toString()) {
                                req.comment = comment;
                                req.news = news;
                                next();
                            } else {
                                const error = new Error("You don't have enough privilage to perform this action");
                                error.statusCode = 401;
                                next(error);
                            }
                        } else {
                            const error = new Error("Comment with id: " + req.params.commentID + " not found");
                            error.statusCode = 400;
                            next(error);
                        }
                    } else {
                        const error = new Error("News with id: " + req.params.newsID + " not found");
                        error.statusCode = 400;
                        next(error);
                    }
                } else {
                    res.status(400).send({ message: validationErrors });
                }
            } catch (e) {
                next(e);
            }
        }
    });
};

const DeleteComment = (req, res, next) => {
    Auth(req, res, async error => {
        if (error) {
            next(error);
        } else {
            try {
                const validationErrors = deleteCommentData(req.params);
                if (Object.keys(validationErrors).length == 0) {
                    const news = await News.findById(req.params.newsID);
                    if (news) {
                        const comment = news.comments.id(req.params.commentID);
                        if (comment) {
                            if (comment.user.toString() == req.user.id.toString() || req.user.role == "ADMIN") {
                                req.comment = comment;
                                req.news = news;
                                next();
                            } else {
                                const error = new Error("You don't have enough privilage to perform this action");
                                error.statusCode = 401;
                                next(error);
                            }
                        } else {
                            const error = new Error("Comment with id: " + req.params.commentID + " not found");
                            error.statusCode = 400;
                            next(error);
                        }
                    } else {
                        const error = new Error("News with id: " + req.params.newsID + " not found");
                        error.statusCode = 400;
                        next(error);
                    }
                } else {
                    res.status(400).send({ message: validationErrors });
                }
            } catch (e) {
                next(e);
            }
        }
    });
};

export { Auth, IfAuth, AdminUser, PostNews, UpdateNews, DeleteNews, UpdateComment, DeleteComment };