import Express from 'express';
import { PostNews, UpdateAndDeleteNews } from '../Middleware/Middleware.js';
import { TakeNewsSchemaFillable } from '../Middleware/TakeFillables.js';
import News from '../Model/News.js';
import * as Validate from '../Utils/Validate.js';
import { newsImageUpload } from '../Utils/fileUpload.js';
import Category from '../Model/Category.js';
import Validator from 'validator';

const newsRouter = new Express.Router();

newsRouter.route("/")
    .post(PostNews, TakeNewsSchemaFillable, async (req, res, next) => {
        try {
            newsImageUpload.array("images")(req, res, async error => {
                if (error) {
                    if (req.files && req.files.length > 0) {
                        req.files.forEach(file => {
                            if (file && FS.existsSync(Path.join(Path.resolve(), file.path))) {
                                FS.unlinkSync(Path.join(Path.resolve(), file.path));
                            }
                        });
                    }
                    next(error);
                } else {
                    const validationErrors = Validate.newsData(req.body);
                    if (Object.keys(validationErrors).length == 0) {

                        const category = await Category.findById(req.body.category);
                        if (category) {
                            const user = req.user;
                            const news = new News(req.body);
                            news.author = user.id;

                            if (req.files && req.files.length > 0)
                                news.images = req.files.map(file => file.path);

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
                }
            });
        } catch (error) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (file && FS.existsSync(Path.join(Path.resolve(), file.path))) {
                        FS.unlinkSync(Path.join(Path.resolve(), file.path));
                    }
                });
            }
            next(error);
        }
    });

newsRouter.route("/:page/:limit/:category/:sortOption/:search")
    .get(async (req, res, next) => {
        try {
            const validationErrors = Validate.getAllNewsParams(req.params);
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
                }

                else if (category !== "null" && search !== "null") {
                    const cat = await Category.findById(category);
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
                    await cat.populate({
                        path: "news",
                        options: {
                            limit,
                            skip
                        }
                    }).execPopulate();
                    data = cat.news;
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
                    await item.populate("author").populate("category").execPopulate();
                    await item.populate({
                        path: "comments",
                        match: {
                            approved: true
                        }
                    }).execPopulate();
                    await item.populate("reacts").execPopulate();
                    await item.populate("comments.user").populate("comments.reacts").execPopulate();
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
    .get(async (req, res, next) => {
        try {
            if (Validator.isMongoId(req.params.newsID)) {
                const news = await News.findById(req.params.newsID);
                if (news)
                    res.send(news);
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
    .put(UpdateAndDeleteNews, TakeNewsSchemaFillable, async (req, res, next) => {
        try {
            newsImageUpload.array("images")(req, res, async error => {
                if (error) {
                    if (req.files && req.files.length > 0) {
                        req.files.forEach(file => {
                            if (file && FS.existsSync(Path.join(Path.resolve(), file.path))) {
                                FS.unlinkSync(Path.join(Path.resolve(), file.path));
                            }
                        });
                    }
                    next(error);
                } else {
                    if (Validator.isMongoId(req.params.newsID)) {
                        const validationErrors = Validate.newsUpdateData(req.body);
                        if (Object.keys(validationErrors).length == 0) {
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
                                if (news.images && news.images.length > 0) {
                                    news.images.forEach(image => {
                                        if (FS.existsSync(Path.join(Path.resolve(), image))) {
                                            FS.unlinkSync(Path.join(Path.resolve(), image));
                                        }
                                    });
                                }
                                news.images = req.files.map(file => file.path);
                            }

                            Object.keys(req.body).forEach(key => news[key] = req.body[key]);
                            await news.save();
                            await news.populate("author").populate("category").execPopulate();
                            await news.populate({
                                path: "comments",
                                match: {
                                    approved: true
                                }
                            }).execPopulate();
                            await news.populate("reacts").execPopulate();
                            await news.populate("comments.user").populate("comments.reacts").execPopulate();
                            res.send(news);
                        } else {
                            res.status(400).send({ message: validationErrors });
                        }
                    } else {
                        const error = new Error("Parameter news id, " + req.params.newsID + " is invalid");
                        error.statusCode = 400;
                        next(error);
                    }
                }
            });
        } catch (error) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    if (file && FS.existsSync(Path.join(Path.resolve(), file.path))) {
                        FS.unlinkSync(Path.join(Path.resolve(), file.path));
                    }
                });
            }
            next(error);
        }
    })
    .delete(UpdateAndDeleteNews, async (req, res, next) => {
        try {
            const news = req.news;
            if (news.images && news.images.length > 0) {
                news.images.forEach(image => {
                    if (file && FS.existsSync(Path.join(Path.resolve(), image))) {
                        FS.unlinkSync(Path.join(Path.resolve(), image));
                    }
                });
            }
            await news.remove();
            res.send(news);
        } catch (error) {
            next(error);
        }
    });

export default newsRouter;