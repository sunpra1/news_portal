import Multer from 'multer';

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/)) {
        let error = new Error("Only JPG, JPEG and PNG format files are supported.");
        error.statusCode = 400;
        cb(error, false);
    } else {
        cb(null, true);
    }
};

const limits = {
    fileSize: 1024 * 1024 * 2
};

const ImageUpload = Multer({
    fileFilter, limits
});

export default ImageUpload;