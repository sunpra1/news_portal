import Express from 'express';
import { AdminUser, Auth, DeleteComment, IfAuth, PostNews, UpdateNews, UpdateComment, DeleteNews } from '../Middleware/Middleware.js';
import { TakeCommentReactSchemaFillable, TakeCommentSchemaFillable, TakeNewsReactSchemaFillable, TakeNewsSchemaFillable } from '../Middleware/TakeFillables.js';
import News from '../Model/News.js';
import { addCommentData, addNewsData, getNewsParams, toggleCommentApproveData, postCommentReactData, postNewsReactData, getPopularNewsData, getSearchSuggestionsData, increaseNewsViewData } from '../Utils/Validate.js';
import ImageUpload from '../Utils/fileUpload.js';
import Category from '../Model/Category.js';
import Validator from 'validator';
import User from '../Model/User.js';
import Comment from '../Model/Comment.js';
import CommentReact from '../Model/CommentReact.js';
import NewsReact from '../Model/NewsReact.js';
import Image from '../Model/Image.js';
import Sharp from 'sharp';

const newsRouter = new Express.Router();

newsRouter.route("/")
    .post(PostNews, ImageUpload.array("images"), TakeNewsSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = addNewsData(req.body);
            if (Object.keys(validationErrors).length == 0) {
                const category = await Category.findById(req.body.category);
                if (category) {
                    const user = req.user;
                    const news = new News(req.body);
                    news.author = user.id;

                    if (req.files && req.files.length > 0) {
                        news.images = await Promise.all(req.files.map(async file => new Image({
                            mimetype: "image/png",
                            buffer: await Sharp(file.buffer).resize({ width: 600, height: 400 }).png().toBuffer()
                        })));
                    }
                    user.news.push(news.id);
                    await user.save();

                    category.news.push(news.id);
                    await category.save();

                    await news.save();

                    news.category = category;
                    news.author = user;
                    res.status(201).send(news);
                } else {
                    const error = new Error("Category with id: " + req.body.category + " not found");
                    error.statusCode = 400;
                    next(error);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:page/:limit/:category/:sortOption/:search")
    .get(IfAuth, async (req, res, next) => {
        try {
            const validationErrors = getNewsParams(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const { category, sortOption, search } = req.params;
                const limit = req.params.limit ? Number(req.params.limit) : 100;
                const page = req.params.page ? Number(req.params.page) : 1;

                let data = null;
                const skip = (page - 1) * limit;
                if (category !== "null" && search !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    const cat = await Category.findById(category);

                    if (cat) {
                        await cat.populate({
                            path: "news",
                            match: {
                                title: { $regex: ".*" + search + ".*", $options: "i" }
                            },
                            options: {
                                sort,
                                limit,
                                skip
                            }
                        }).execPopulate();
                        data = cat.news;
                    } else {
                        data = [];
                    }
                }

                else if (category !== "null" && search !== "null") {
                    const cat = await Category.findById(category);
                    if (cat) {
                        await cat.populate({
                            path: "news",
                            match: {
                                title: { $regex: ".*" + search + ".*", $options: "i" }
                            },
                            options: {
                                limit,
                                skip
                            }
                        }).execPopulate();

                        data = cat.news;
                    } else {
                        data = [];
                    }
                }

                else if (category !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    const cat = await Category.findById(category);
                    await cat.populate({
                        path: "news",
                        options: {
                            sort,
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = cat.news;
                }

                else if (search !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    data = await News.find({ title: { $regex: ".*" + search + ".*", $options: "i" } }).sort(sort).limit(limit).skip(skip);
                }

                else if (category !== "null") {
                    const cat = await Category.findById(category);
                    if (cat) {
                        await cat.populate({
                            path: "news",
                            options: {
                                limit,
                                skip
                            }
                        }).execPopulate();
                        data = cat.news;
                    } else {
                        data = [];
                    }
                }

                else if (search !== "null") {
                    data = await News.find({ title: { $regex: ".*" + search + ".*", $options: "i" } });
                }

                else if (sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";
                    data = await News.find({}).sort(sort).limit(limit).skip(skip);
                }

                else {
                    data = await News.find({}).sort({ createdAt: -1 }).limit(limit).skip(skip);
                }
                data = await Promise.all(data.map(async item => {
                    if (!(req.user && req.user.role == "ADMIN")) {
                        item.comments = item.comments.filter(comment => comment.approved);
                    }
                    await item.populate("author").populate("category").populate("comments.user").populate("comments.reacts").execPopulate();
                    return item;
                }));
                res.send(data);

            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/my/:page/:limit/:category/:sortOption/:search")
    .get(Auth, async (req, res, next) => {
        try {
            const validationErrors = getNewsParams(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const { category, sortOption, search } = req.params;
                const limit = req.params.limit ? Number(req.params.limit) : 100;
                const page = req.params.page ? Number(req.params.page) : 1;

                let data = null;
                const skip = (page - 1) * limit;
                const user = req.user;
                if (category !== "null" && search !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    await user.populate({
                        path: "news",
                        match: {
                            title: { $regex: ".*" + search + ".*", $options: "i" },
                            category
                        },
                        options: {
                            sort,
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (category !== "null" && search !== "null") {
                    await user.populate({
                        path: "news",
                        match: {
                            title: { $regex: ".*" + search + ".*", $options: "i" },
                            category
                        },
                        options: {
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (category !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    await user.populate({
                        path: "news",
                        match: {
                            category
                        },
                        options: {
                            sort,
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (search !== "null" && sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";

                    await user.populate({
                        path: "news",
                        match: {
                            title: { $regex: ".*" + search + ".*", $options: "i" }
                        },
                        options: {
                            sort,
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (category !== "null") {
                    await user.populate({
                        path: "news",
                        match: {
                            category
                        },
                        options: {
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (search !== "null") {
                    await user.populate({
                        path: "news",
                        match: {
                            title: { $regex: ".*" + search + ".*", $options: "i" }
                        },
                        options: {
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else if (sortOption !== "null") {
                    let sort = {};
                    sortOption == "new" ? sort.createdAt = -1 : "";
                    sortOption == "old" ? sort.createdAt = 1 : "";
                    sortOption == "popular" ? sort.views = -1 : "";
                    await user.populate({
                        path: "news",
                        options: {
                            sort,
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }

                else {
                    await user.populate({
                        path: "news",
                        options: {
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = user.news;
                }
                data = await Promise.all(data.map(async item => {
                    await item.populate("author").populate("category").populate("comments.user").populate("comments.reacts").execPopulate();
                    return item;
                }));
                res.send(data);

            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID")
    .get(IfAuth, async (req, res, next) => {
        try {
            if (Validator.isMongoId(req.params.newsID)) {
                const news = await News.findById(req.params.newsID);
                if (news) {
                    if (!(req.user && req.user.role == "ADMIN")) {
                        news.comments = news.comments.filter(comment => comment.approved);
                    }
                    await news.populate("author").populate("category").populate("comments.user").populate("comments.reacts").execPopulate();
                    res.send(news);
                }
                else {
                    const error = new Error("News with id: " + req.params.newsID + " not found");
                    error.statusCode = 400;
                    next(error);
                }
            } else {
                const error = new Error("Parameter news id, " + req.params.newsID + " is invalid");
                error.statusCode = 400;
                next(error);
            }
        } catch (error) {
            next(error);
        }
    })
    .put(UpdateNews, ImageUpload.array("images"), TakeNewsSchemaFillable, async (req, res, next) => {
        try {
            const news = req.news;
            if (req.body.category && req.body.category != news.category.id.toString()) {
                const oldCategory = await Category.findById(news.category);
                oldCategory.news = oldCategory.news.filter(newsID => newsID.toString() != news.id.toString());
                await oldCategory.save();

                const updatedCategory = await Category.findById(req.body.category);
                if (!updatedCategory.news.some(newsID => newsID.toString() == news.id.toString())) {
                    updatedCategory.news.push(news.id);
                    await updatedCategory.save();
                }
                news.category = updatedCategory.id;
            }

            if (req.files && req.files.length > 0) {
                news.images = req.files.map(async file => new Image({
                    mimetype: "image/png",
                    buffer: await Sharp(file.buffer).resize({ width: 600, height: 400 }).png().toBuffer()
                }));
            }
            Object.keys(req.body).forEach(key => news[key] = req.body[key]);
            await news.save();
            await news.populate("author").populate("category").populate("comments.user").populate("comments.reacts").execPopulate();
            res.send(news);
        } catch (error) {
            next(error);
        }
    })
    .delete(DeleteNews, async (req, res, next) => {
        try {
            const news = req.news;
            const newsAuthor = await User.findById(news.author);
            newsAuthor.news = newsAuthor.news.filter(newsId => newsId.toString() != news.id.toString());
            const newsCategory = await Category.findById(news.category);
            newsCategory.news = newsCategory.news.filter(newsId => newsId.toString() != news.id.toString());
            await news.remove();
            await newsAuthor.save();
            await newsCategory.save();
            res.send(news);
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID/comments")
    .post(Auth, TakeCommentSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = addCommentData({ ...req.body, ...req.params });
            if (Object.keys(validationErrors).length == 0) {
                const news = await News.findById(req.params.newsID);
                if (news) {
                    const comment = new Comment(req.body);
                    comment.news = news.id;
                    comment.user = req.user.id;
                    news.comments.push(comment);
                    await news.save();
                    res.status(201).send(comment);
                } else {
                    const error = new Error("News with id: " + req.params.newsID + " not found");
                    error.statusCode = 400;
                    next(error);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID/comments/:commentID")
    .put(UpdateComment, async (req, res, next) => {
        try {
            const news = req.news;
            const comment = req.comment;
            Object.keys(req.body).forEach(key => {
                comment[key] = req.body[key];
            });
            await news.save();
            res.send(comment);
        } catch (error) {
            next(error);
        }
    })
    .delete(DeleteComment, async (req, res, next) => {
        try {
            const news = req.news;
            const comment = req.comment;
            comment.remove();
            await news.save();
            res.send(comment);
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID/comments/:commentID/toggleApprove")
    .put(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = toggleCommentApproveData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const news = await News.findById(req.params.newsID);
                const comment = news.comments.id(req.params.commentID);
                const commentIndex = news.comments.findIndex(com => com.id.toString() == comment.id.toString());
                comment.approved = !comment.approved;
                await news.populate(`comments.${commentIndex}.user`).populate(`comments.${commentIndex}.reacts`).execPopulate();
                await news.save();
                res.send(comment);
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID/increaseView")
    .put(async (req, res, next) => {
        const validationErrors = increaseNewsViewData(req.params);
        if (Object.keys(validationErrors).length == 0) {
            const news = await News.findById(req.params.newsID);
            if (news) {
                news.views = news.views + 1;
                await news.save();
                res.send(news);
            } else {
                const error = new Error("News with id: " + req.params.newsID + " not found");
                error.statusCode = 400;
                next(error);
            }
        } else {
            res.status(400).send({ message: validationErrors });
        }
    });

newsRouter.route("/:newsID/reacts")
    .post(Auth, TakeNewsReactSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = postNewsReactData({ ...req.body, ...req.params });
            if (Object.keys(validationErrors).length == 0) {
                const news = await News.findById(req.params.newsID);
                if (news) {
                    const index = news.reacts.findIndex(react => react.user.toString() == req.user.id.toString());
                    let react;
                    if (index >= 0) {
                        react = news.reacts[index];
                        if (react.type == req.body.type.toUpperCase()) {
                            react.remove();
                        } else {
                            react.type = req.body.type;
                        }
                    } else {
                        react = new NewsReact(req.body);
                        react.user = req.user.id;
                        news.reacts.push(react);
                    }
                    await news.save();
                    res.send(react);
                } else {
                    const error = new Error("News with id: " + req.params.newsID + " not found");
                    error.statusCode = 400;
                    next(error);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/:newsID/comments/:commentID/reacts")
    .post(Auth, TakeCommentReactSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = postCommentReactData({ ...req.body, ...req.params });
            if (Object.keys(validationErrors).length == 0) {
                const news = await News.findById(req.params.newsID);
                if (news) {
                    const comment = news.comments.id(req.params.commentID);
                    if (comment) {
                        const index = comment.reacts.findIndex(react => react.user.toString() == req.user.id.toString());
                        let react;
                        if (index >= 0) {
                            react = comment.reacts[index];
                            if (react.type == req.body.type.toUpperCase()) {
                                react.remove();
                            } else {
                                react.type = req.body.type;
                            }
                        } else {
                            react = new CommentReact(req.body);
                            react.user = req.user.id;
                            comment.reacts.push(react);
                        }
                        await news.save();
                        res.send(react);
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
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/popular/:period/:isCategoryWise/:threshold")
    .get(IfAuth, async (req, res, next) => {
        try {
            const validationErrors = getPopularNewsData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const { isCategoryWise, threshold } = req.params;
                const period = req.params.period.toUpperCase();
                const todayDate = new Date();

                const lessThen = new Date();
                switch (period) {
                    case "PREVIOUS_MONTH": {
                        lessThen.setMonth(todayDate.getMonth() - 1);
                        break;
                    }

                    case "PREVIOUS_WEEK": {
                        lessThen.setDate(todayDate.getDate() - 7);
                        break;
                    }

                    default: {
                        lessThen.setDate(todayDate.getDate() + 1);
                        break;
                    }
                }

                const greaterThen = new Date();
                switch (period) {
                    case "PREVIOUS_MONTH": {
                        greaterThen.setMonth(todayDate.getMonth() - 2);
                        break;
                    }

                    case "PREVIOUS_WEEK": {
                        greaterThen.setDate(todayDate.getDate() - 14);
                        break;
                    }

                    case "THIS_MONTH": {
                        greaterThen.setMonth(todayDate.getMonth() - 1);
                        break;
                    }

                    default: {
                        greaterThen.setDate(todayDate.getDate() - 7);
                        break;
                    }
                }
                if (isCategoryWise == "true" && isCategoryWise != "false") {
                    let categories = await Category.find().populate({
                        path: "news",
                        match: {
                            createdAt: {
                                $gte: greaterThen,
                                $lt: lessThen
                            },
                            views: {
                                $gte: Number(threshold)
                            }
                        },
                        options: {
                            sort: {
                                views: -1
                            },
                            skip: 0
                        }
                    });

                    categories = await Promise.all(categories.map(async category => {
                        if (!(req.user && req.user.role == "ADMIN")) {
                            category.news = await Promise.all(category.news.map(singleNews => {
                                singleNews.comments = singleNews.comments.filter(comment => comment.approved);
                                return singleNews;
                            }));
                        }
                        return await category.populate("news.author").populate("news.category").populate("news.comments.user").populate("news.comments.reacts").execPopulate();
                    }));
                    res.send(categories);
                } else {
                    let news = await News.find({
                        createdAt: {
                            $gte: greaterThen,
                            $lt: lessThen
                        },
                        views: {
                            $gte: Number(threshold)
                        }
                    }).sort({ views: -1 });

                    news = await Promise.all(news.map(async singleNews => {
                        if (!(req.user && req.user.role == "ADMIN")) {
                            singleNews.comments = singleNews.comments.filter(comment => comment.approved);
                        }
                        return await singleNews.populate("author").populate("category").populate("comments.user").populate("comments.reacts").execPopulate();
                    }));
                    res.send(news);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

newsRouter.route("/search_suggestions/:searchTerm/:limit")
    .get(async (req, res, next) => {
        try {
            const validationErrors = getSearchSuggestionsData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const newsSuggestions = await News.find({ title: { $regex: ".*" + req.params.searchTerm + ".*", $options: "i" } }).select("title").limit(Number(req.params.limit));
                res.send(newsSuggestions);
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });


newsRouter.route("/my/search_suggestions/:searchTerm/:limit")
    .get(Auth, async (req, res, next) => {
        try {
            const validationErrors = getSearchSuggestionsData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const user = req.user;
                const search = req.params.searchTerm;
                const limit = req.params.limit;
                await user.populate({
                    path: "news",
                    select: "title",
                    match: {
                        title: { $regex: ".*" + search + ".*", $options: "i" }
                    },
                    options: {
                        limit
                    }
                }).execPopulate();
                res.send(user.news);
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

export default newsRouter;