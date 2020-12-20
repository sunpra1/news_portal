import Jwt from 'jsonwebtoken';
import Validator from 'validator';
import News from '../Model/News.js';
import User from '../Model/User.js';

const Auth = async (req, res, next) => {
    const token = req.header("authorization");
    try {
        if (token) {
            const decodedToken = Jwt.verify(token, process.env.JWT_SECRET);
            let user = await User.findOne({ _id: decodedToken, "tokens.token": token }).catch(e => next(e));
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

const UpdateAndDeleteNews = (req, res, next) => {
    Auth(req, res, async error => {
        if (error) {
            next(error);
        } else {
            try {
                if (Validator.isMongoId(req.params.newsID)) {
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
                    const error = new Error("Parameter news id, " + req.params.newsID + " is invalid");
                    error.statusCode = 400;
                    next(error);
                }
            } catch (e) {
                next(e);
            }
        }
    });
};


export { Auth, AdminUser, PostNews, UpdateAndDeleteNews };