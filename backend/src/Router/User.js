import Express from 'express';
import User from '../Model/User.js';
import Bcrypt from 'bcryptjs';
import * as Validate from '../Utils/Validate.js';
import { Auth } from '../Middleware/Middleware.js';
import { userImageUpload } from '../Utils/fileUpload.js';
import FS from 'fs';
import Path from 'path';
import { TakeUserSchemaFillable } from '../Middleware/TakeFillables.js';

const userRouter = Express.Router();
userRouter.route("/register")
    .post(TakeUserSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = await Validate.userData(req.body);
            
            if (Object.keys(validationErrors).length == 0) {
                let user = new User(req.body);
                user.password = Bcrypt.hashSync(user.password, 8);
                user = await user.save();
                if (user) {
                    const token = await user.generateAuthToken();
                    res.status(201).send({ user, token });
                } else {
                    const errors = new Error("Registration failed");
                    errors.statusCode = 400;
                    next(errors);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (e) {
            next(e);
        }
    });

userRouter.route("/validate-unique-user")
    .post(async (req, res, next) => {
        try {
            const validationErrors = Validate.uniqueUserData(req.body);
            if (Object.keys(validationErrors).length == 0) {
                const user = await User.findOne({ phone: req.body.phone });
                const isUnique = user ? false : true;
                res.send({ isUnique, user });
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (e) {
            next(e);
        }
    });

userRouter.route("/login")
    .post(async (req, res, next) => {
        try {
            const validationErrors = Validate.loginData(req.body);
            if (Object.keys(validationErrors).length == 0) {

                const user = await User.findOne({ phone: req.body.phone });
                if (user) {
                    if (Bcrypt.compareSync(req.body.password, user.password)) {
                        const token = await user.generateAuthToken();
                        res.send({ user, token });
                    } else {
                        const error = new Error("Invalid password provided");
                        error.statusCode = 404;
                        next(error);
                    }
                } else {
                    const error = new Error("Invalid phone number or email address provided");
                    error.statusCode = 404;
                    next(error);
                }
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (e) {
            next(e);
        }
    });

userRouter.route("/profile")
    .get(Auth, (req, res, next) => {
        try {
            res.send(req.user);
        } catch (e) {
            next(e);
        }
    })
    .put(Auth, TakeUserSchemaFillable, async (req, res, next) => {
        try {
            userImageUpload.single("image")(req, res, async error => {
                if (error) {
                    if (req.file && FS.existsSync(Path.join(Path.resolve(), req.file.path))) {
                        FS.unlinkSync(Path.join(Path.resolve(), req.file.path));
                    }
                    next(error);
                } else {
                    let user = req.user;
                    if (user.email == req.body.email) {
                        delete req.body.email;
                    }
                    const validationErrors = Validate.userUpdateData(req.body);
                    if (!validationErrors) {
                        if (req.body.password)
                            req.body.password = await Bcrypt.hash(req.body.password, 8);

                        if (req.file) {
                            //Deleting the old image
                            if (user.image && FS.existsSync(Path.join(Path.resolve(), user.image))) {
                                FS.unlinkSync(Path.join(Path.resolve(), user.image));
                            }
                            user.image = req.file.path;
                        }

                        Object.keys(req.body).forEach(key => user[key] = req.body[key]);
                        user = await user.save();
                        res.send(user);
                    } else {
                        res.status(400).send({ message: validationErrors });
                    }
                }
            });
        } catch (error) {
            if (req.file && FS.existsSync(Path.join(Path.resolve(), req.file.path))) {
                FS.unlinkSync(Path.join(Path.resolve(), req.file.path));
            }
            next(error);
        }
    });

userRouter.route("/logout")
    .post(Auth, async (req, res, next) => {
        try {
            req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
            await req.user.save();
            res.send({ message: "You logged out successfully" });
        } catch (e) {
            next(e);
        }
    });

userRouter.route("/logoutAll")
    .post(Auth, async (req, res, next) => {
        try {
            req.user.tokens = [];
            await req.user.save();
            res.send({ message: "You logged out successfully" });
        } catch (e) {
            next(e);
        }
    });

export default userRouter;