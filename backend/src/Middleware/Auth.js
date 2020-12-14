import Jwt from 'jsonwebtoken';
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
    Auth(req, res, () => {
        try {
            if (req.user.role === "ADMIN") {
                next();
            } else {
                const error = new Error("You don't have enough privilage to perform this action.");
                error.statusCode = 401;
                next(error);
            }
        } catch (e) {
            next(e);
        }
    });
};


export { Auth, AdminUser };