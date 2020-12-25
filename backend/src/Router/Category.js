import Express from 'express';
import Category from '../Model/Category.js';
import { Auth, AdminUser } from '../Middleware/Middleware.js';
import { addCategoryData, updateCategoryData } from '../Utils/Validate.js';

const categoryRoute = new Express.Router();

categoryRoute.route('/')
    .get(async (req, res, next) => {
        const categories = await Category.find({});
        res.send(categories);
    })
    .post(Auth, AdminUser, async (req, res, next) => {
        const validationErrors = await addCategoryData(req.body);
        if (Object.keys(validationErrors).length == 0) {
            const category = await Category.create(req.body).catch(e => next(e));
            res.status(201).send(category);
        } else {
            res.status(400).send({ message: validationErrors });
        }
    });

categoryRoute.route("/:categoryID")
    .get(async (req, res, next) => {
        try {
            const category = await Category.findById(req.params.categoryID);
            await category.populate("news").execPopulate();
            await category.populate("news.author").populate("news.comments").populate("news.reacts").execPopulate();
            await category.populate("news.comments.user").execPopulate();
            res.send(category);
        } catch (error) {
            next(error);
        }
    })
    .put(AdminUser, async (req, res, next) => {
        const validationErrors = await updateCategoryData({ ...req.body, ...req.params });
        if (Object.keys(validationErrors).length == 0) {
            let category = await Category.findById(req.params.categoryID).catch(e => next(e));
            if (category) {
                if (category.news.length == 0) {
                    if (req.body.category && category.category != req.body.category)
                        category.category = req.body.category;

                    category = await category.save();
                    res.send(category);
                } else {
                    const error = new Error(category.news.length + " news belongs to this category, updation of the category is prohibited");
                    error.statusCode = 400;
                    next(error);
                }
            } else {
                const error = new Error("Category with id: " + req.params.categoryID + " not found");
                error.statusCode = 400;
                next(error);
            }
        } else {
            res.status(400).send({ message: validationErrors });
        }
    })
    .delete(AdminUser, async (req, res, next) => {
        let category = await Category.findById(req.params.categoryID).catch(e => next(e));
        if (category) {
            if (category.news.length == 0) {
                category = await category.remove();
                res.send(category);
            } else {
                const error = new Error(category.news.length + " news belongs to this category, deletion of the category is prohibited.");
                error.statusCode = 400;
                next(error);
            }
        } else {
            const error = new Error("Category with id: " + req.params.categoryID + " not found");
            error.statusCode = 400;
            next(error);
        }
    });

export default categoryRoute;
