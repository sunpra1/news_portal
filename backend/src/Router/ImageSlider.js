import Express from 'express';
import { AdminUser, IfAuth } from '../Middleware/Middleware.js';
import Image from '../Model/Image.js';
import ImageSlider from '../Model/ImageSlider.js';
import ImageUpload from '../Utils/fileUpload.js';
import { addNewSliderImageData, deleteSliderImageData, toggleSliderImageVisibilityData } from '../Utils/Validate.js';
import Sharp from 'sharp';

const imageSliderRouter = new Express.Router();
imageSliderRouter.route("/")
    .get(IfAuth, async (req, res, next) => {
        let sliderImages = await ImageSlider.find({});
        if (!(req.user && req.user.role == "ADMIN")) {
            sliderImages = sliderImages.filter(image => image.visibility);
        }
        res.send(sliderImages);
    })
    .post(AdminUser, ImageUpload.single("image"), async (req, res, next) => {
        try {
            const validationErrors = addNewSliderImageData({ file: req.file, ...req.body });
            if (Object.keys(validationErrors).length == 0) {
                const image = new Image({
                    mimetype: "image/jpeg",
                    buffer: Buffer.from(await Sharp(req.file.buffer).jpeg({ quality: 48 }).toBuffer()).toString("base64")
                });
                const sliderImage = new ImageSlider({ image, ...req.body });
                await sliderImage.save();
                res.send(sliderImage);
            } else {
                res.status(400).send({ message: validationErrors });
            }
        } catch (error) {
            next(error);
        }
    });

imageSliderRouter.route("/:imageSliderID")
    .delete(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = deleteSliderImageData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const sliderImage = await ImageSlider.findById(req.params.imageSliderID);
                if (sliderImage) {
                    await sliderImage.remove();
                    res.send(sliderImage);
                } else {
                    const error = new Error("Slider image with id: " + req.params.imageSliderID + " not found");
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

imageSliderRouter.route("/:imageSliderID/toggleVisibility")
    .put(AdminUser, async (req, res, next) => {
        try {
            const validationErrors = toggleSliderImageVisibilityData(req.params);
            if (Object.keys(validationErrors).length == 0) {
                const sliderImage = await ImageSlider.findById(req.params.imageSliderID);
                if (sliderImage) {
                    sliderImage.visibility = !sliderImage.visibility;
                    await sliderImage.save();
                    res.send(sliderImage);
                } else {
                    const error = new Error("Slider image with id: " + req.params.imageSliderID + " not found");
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

export default imageSliderRouter;