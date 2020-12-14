import Multer from 'multer';

const userStorage = Multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/users");
    },
    filename: (req, file, cb) => {
        const fileName = file.fieldname + Date.now() + "_" + file.originalname;
        cb(null, fileName);
    }
});

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

const userImageUpload = Multer({
    storage: userStorage, fileFilter, limits
});

export { userImageUpload };