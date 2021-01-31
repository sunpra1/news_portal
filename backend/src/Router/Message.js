import Express from 'express';
import Message from '../Model/Message.js';
import { TakeMessageSchemaFillable } from '../Middleware/TakeFillables.js';
import { AdminUser } from '../Middleware/Middleware.js';
import { postNewMessageData, deleteMessageData, toggleMessageRepliedData } from '../Utils/Validate.js';

const messageRouter = new Express.Router();
messageRouter.route("/")
    .get(AdminUser, async (req, res, next) => {
        try {
            const messages = await Message.find({});
            res.send(messages);
        } catch (error) {
            next(error);
        }
    })
    .post(TakeMessageSchemaFillable, async (req, res, next) => {
        try {
            const validationErrors = postNewMessageData(req.body);
            if (Object.keys(validationErrors).length == 0) {
                const message = await Message.create(req.body);
                res.status(201).send(message);
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

messageRouter.route("/:messageID")
    .delete(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = deleteMessageData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const message = await Message.findById(req.params.messageID);
                if (message) {
                    await message.remove();
                    res.send(message);
                } else {
                    const error = new Error("Message with id: " + req.params.messageID + " not found");
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

messageRouter.route("/:messageID/toggleReplied")
    .put(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = toggleMessageRepliedData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const message = await Message.findById(req.params.messageID);
                if (message) {
                    message.replied = !message.replied;
                    await message.save();
                    res.send(message);
                } else {
                    const error = new Error("Message with id: " + req.params.messageID + " not found");
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

export default messageRouter;