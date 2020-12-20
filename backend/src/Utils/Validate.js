import validator from 'validator';
import Validator from 'validator';
import User from '../Model/User.js';

const userData = async data => {
    let error = {};

    if (data.fullName) {
        if (Validator.trim(data.fullName).length == 0) {
            error.fullName = "Full name is left empty";
        }
    } else {
        error.fullName = "Full name is required field";
    }

    if (data.phone) {
        if (Validator.trim(data.phone.toString()).length == 0) {
            error.phone = "Phone number is left empty";
        } else if (!Validator.isNumeric(Validator.trim(data.phone.toString()))) {
            error.phone = "Phone number must be numeric";
        } else if (Validator.trim(data.phone.toString()).length != 10) {
            error.phone = "Phone number must be 10 characters long";
        } else if (!await User.isUnique(data.phone)) {
            error.phone = "Please provide unique phone number";
        }
    } else {
        error.phone = "Phone number is required field";
    }

    if (data.password) {
        if (Validator.trim(data.password).length == 0) {
            error.password = "Phone is left empty";
        } else if (Validator.trim(data.password.toString()).length < 6) {
            error.password = "Password must be minimum of 6 characters long";
        }
    } else {
        error.password = "Password is required field";
    }

    return error;
};

const userUpdateData = async data => {
    let error = {};

    if (data.fullName) {
        if (Validator.trim(data.fullName).length == 0) {
            error.fullName = "Full name is left empty";
        }
    }

    if (data.email) {
        if (Validator.trim(data.email).length == 0) {
            error.email = "Email address is left empty";
        } else if (!Validator.isEmail(Validator.trim(data.email))) {
            error.email = "Please provide valid email address";
        } else if (!await User.isUnique(data.email)) {
            error.email = "Please provide unique email address";
        }
    }

    if (data.password) {
        if (Validator.trim(data.password).length == 0) {
            error.password = "Phone is left empty";
        } else if (Validator.trim(data.password.toString()).length < 6) {
            error.password = "Password must be minimum of 6 characters long";
        }
    }

    return error;
};

const uniqueUserData = data => {
    let error = {};
    if (data.phone) {
        if (Validator.trim(data.phone.toString()).length == 0) {
            error.phone = "Phone is left empty";
        } else if (Validator.trim(data.phone.toString()).length != 10) {
            error.phone = "Phone number must be 10 characters long";
        } else if (!Validator.isNumeric(Validator.trim(data.phone.toString()))) {
            error.phone = "Please provide valid phone number";
        }
    } else {
        error.phone = "Phone number is required field";
    }

    return error;
};

const loginData = data => {
    let error = {};

    if (data.phone) {
        if (Validator.trim(data.phone.toString()).length != 10) {
            error.phone = "Phone must be 10 characters long";
        } else if (!Validator.isNumeric(Validator.trim(data.phone.toString()))) {
            error.phone = "Phone number must contain numeric value";
        }
    } else {
        error.email = "Phone number is required";
    }
    if (data.password) {
        if (Validator.trim(data.password).length == 0) {
            error.password = "Password id  is left empty";
        } else if (Validator.trim(data.password).length < 6) {
            error.password = "Password must be six characters long";
        }
    } else {
        error.password = "Password id is required field";
    }
    return error;
};

const validateCategory = (data) => {
    let error = {};
    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        }
    } else {
        error.category = "Category is required";
    }

    return error;
};

const validateUpdateCategory = (data) => {
    let error = {};
    if (!Validator.isMongoId(data.categoryID)) {
        error.categoryID = "Provide valid id for param categoryID";
    }

    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        }
    } else {
        error.category = "Category is required";
    }

    return error;
};

const newsData = data => {
    let error = {};

    if (data.title) {
        if (Validator.trim(data.title).length == 0) {
            error.title = "Title is left empty";
        }
    } else {
        error.title = "Title is required field";
    }

    if (data.description) {
        if (Validator.trim(data.description).length == 0) {
            error.description = "Description is left empty";
        }
    } else {
        error.description = "Description is required field";
    }

    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        } else if (!Validator.isMongoId(data.category)) {
            error.category = "Category id is invalid";
        }
    } else {
        error.category = "Category is required field";
    }

    return error;
};

const getAllNewsParams = data => {
    let error = {};
    if (data.page) {
        if (!Validator.isNumeric(data.page)) {
            error.page = "Parameter page must be numeric value";
        } else if (Number(data.page) <= 0) {
            error.limit = "Parameter page must be greater then 0";
        }
    }

    if (data.limit) {
        if (!Validator.isNumeric(data.limit)) {
            error.limit = "Parameter limit must be numeric value";
        } else if (Number(data.limit) <= 0) {
            error.limit = "Parameter limit must be greater then 0";
        }
    }

    if (data.category != "null" && !Validator.isMongoId(data.category)) {
        error.category = "Parameter category id, " + data.category + " is invalid";
    }

    return error;
};

const newsUpdateData = data => {
    let error = {};

    if (data.title) {
        if (Validator.trim(data.title).length == 0) {
            error.title = "Title is left empty";
        }
    }

    if (data.description) {
        if (Validator.trim(data.description).length == 0) {
            error.description = "Description is left empty";
        }
    }

    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        } else if (!Validator.isMongoId(data.category)) {
            error.category = "Category id is invalid";
        }
    }

    return error;
};

export { userData, uniqueUserData, loginData, userUpdateData, validateCategory, validateUpdateCategory, newsData, getAllNewsParams, newsUpdateData };