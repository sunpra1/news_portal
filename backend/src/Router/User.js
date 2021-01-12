import Express from 'express';
import User from '../Model/User.js';
import Bcrypt from 'bcryptjs';
import { addUserData, uniqueUserData, loginData, updateUserData, updateUserRoleData } from '../Utils/Validate.js';
import { AdminUser, Auth } from '../Middleware/Middleware.js';
import FileUpload from '../Utils/fileUpload.js';
import FS from 'fs';
import Path from 'path';
import { TakeUserSchemaFillable } from '../Middleware/TakeFillables.js';
import Image from '../Model/Image.js';
import Sharp from 'sharp';

const userRouter = Express.Router();
userRouter.route("/register")
    .post(TakeUserSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = await addUserData(req.body);
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
            const validationErrors = uniqueUserData(req.body);
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

userRouter.route("/update-role")
    .put(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = updateUserRoleData(req.body);
            if (Object.keys(validationErrors).length == 0) {
                const user = await User.findById(req.body.id);
                if (user) {
                    if (req.user.id.toString() != user.id.toString()) {
                        user.role = req.body.role.toUpperCase();
                        await user.save();
                        res.send(user);
                    } else {
                        const error = new Error("Updation of own role is prohibited");
                        error.statusCode = 400;
                        next(error);
                    }
                } else {
                    const error = new Error(`User with id: ${req.params.id} not found`);
                    error.statusCode = 400;
                    next(error);
                }
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
            const validationErrors = loginData(req.body);
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
    .get(Auth, async (req, res, next) => {
        try {
            const user = req.user;
            res.send(user);
        } catch (e) {
            next(e);
        }
    })
    .put(Auth, TakeUserSchemaFillable, async (req, res, next) => {
        try {
            FileUpload.single("image")(req, res, async error => {
                if (error) {
                    next(error);
                } else {
                    let user = req.user;
                    const validationErrors = updateUserData(req.body);
                    if (Object.keys(validationErrors).length == 0) {
                        if (req.body.password)
                            req.body.password = await Bcrypt.hash(req.body.password, 8);

                        if (req.file) {
                            const image = new Image(new Image({
                                mimetype: "image/png",
                                buffer: await Sharp(req.file.buffer).resize({ width: 150, height: 150 }).png().toBuffer()
                            }));
                            user.image = image;
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