import Validator from 'validator';
import Category from '../Model/Category.js';
import User from '../Model/User.js';

const addUserData = async data => {
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

const updateUserData = async data => {
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

const updateUserRoleData = data => {
    let error = {};
    if (data.id) {
        if (Validator.trim(data.id.toString()).length == 0) {
            error.id = "User id is left empty";
        } else if (!Validator.isMongoId(data.id.toString())) {
            error.id = "User id provided is not valid";
        }
    } else {
        error.id = "User id is required field";
    }

    if (data.role) {
        if (Validator.trim(data.role.toString()).length == 0) {
            error.role = "User role is left empty";
        } else if (!["ADMIN", "AUTHOR", "USER"].includes(Validator.trim(data.role).toUpperCase())) {
            error.role = "ADMIN, AUTHOR, and USER are only valid user roles";
        }
    } else {
        error.role = "User role is required field";
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

const addCategoryData = async data => {
    let error = {};
    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        } else if (!await Category.isUnique(data.category)) {
            error.category = "Category already exists";
        }
    } else {
        error.category = "Category is required";
    }

    return error;
};

const getCategoryData = data => {
    let error = {};
    if (!Validator.isMongoId(data.categoryID)) {
        error.categoryID = "Provide valid id for route parameter categoryID";
    }
    return error;
};

const deleteCategoryData = data => {
    let error = {};
    if (!Validator.isMongoId(data.categoryID)) {
        error.categoryID = "Provide valid id for route parameter categoryID";
    }
    return error;
};

const updateCategoryData = async (data) => {
    let error = {};
    if (!Validator.isMongoId(data.categoryID)) {
        error.categoryID = "Provide valid id for route parameter categoryID";
    }

    if (data.category) {
        if (Validator.trim(data.category).length == 0) {
            error.category = "Category is left empty";
        } else if (!await Category.isUnique(data.category)) {
            error.category = "Category already exists";
        }
    } else {
        error.category = "Category is required";
    }

    return error;
};

const addNewsData = data => {
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

const getNewsParams = data => {
    let error = {};

    if (data.page) {
        if (!Validator.isNumeric(data.page)) {
            error.page = "Route Parameter page must be numeric value";
        } else if (Number(data.page) <= 0) {
            error.limit = "Route Parameter page must be greater then 0";
        }
    }

    if (data.limit) {
        if (!Validator.isNumeric(data.limit)) {
            error.limit = "Route Parameter limit must be numeric value";
        } else if (Number(data.limit) <= 0) {
            error.limit = "Route Parameter limit must be greater then 0";
        }
    }

    if (data.category != "null" && !Validator.isMongoId(data.category)) {
        error.category = "Route Parameter category id is invalid";
    }

    return error;
};

const getBackendNewsParams = data => {
    let error = {};
    if (data.page) {
        if (!Validator.isNumeric(data.page)) {
            error.page = "Route Parameter page must be numeric value";
        } else if (Number(data.page) <= 0) {
            error.limit = "Route Parameter page must be greater then 0";
        }
    }

    if (data.limit) {
        if (!Validator.isNumeric(data.limit)) {
            error.limit = "Route Parameter limit must be numeric value";
        } else if (Number(data.limit) <= 0) {
            error.limit = "Route Parameter limit must be greater then 0";
        }
    }

    if (data.category != "null" && !Validator.isMongoId(data.category)) {
        error.category = "Route Parameter category id is invalid";
    }


    if (data.approved && !Validator.isBoolean(data.approved)) {
        error.approved = "Route Parameter approved must be boolean value";
    }


    return error;
};

const updateNewsData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";;
    }

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

const deleteNewsData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";;
    }

    return error;
};

const addCommentData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (data.comment) {
        if (Validator.trim(data.comment).length == 0) {
            error.comment = "Comment is left empty";
        }
    } else {
        error.comment = "Comment is required field";
    }

    return error;
};

const updateCommentData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (!Validator.isMongoId(data.commentID)) {
        error.commentID = "Provide valid id for route parameter commentID";
    }

    if (data.comment) {
        if (Validator.trim(data.comment).length == 0) {
            error.comment = "Comment is left empty";
        }
    }

    return error;
};

const deleteCommentData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (!Validator.isMongoId(data.commentID)) {
        error.commentID = "Provide valid id for route parameter commentID";
    }
    return error;
};

const toggleCommentApproveData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (!Validator.isMongoId(data.commentID)) {
        error.commentID = "Provide valid id for route parameter commentID";
    }

    return error;
};

const increaseNewsViewData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    return error;
};

const postCommentReactData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (!Validator.isMongoId(data.commentID)) {
        error.commentID = "Provide valid id for route parameter commentID";
    }

    if (data.type) {
        if (Validator.trim(data.type).length == 0) {
            error.type = "React type is left empty";
        } else if (!["LIKE", "DISLIKE"].includes(data.type.toUpperCase())) {
            error.type = "LIKE, and DISLIKE are only valid react types";
        }
    }

    return error;
};

const postNewsReactData = data => {
    let error = {};

    if (!Validator.isMongoId(data.newsID)) {
        error.newsID = "Provide valid id for route parameter newsID";
    }

    if (data.type) {
        if (Validator.trim(data.type).length == 0) {
            error.type = "React type is left empty";
        } else if (!["HAPPY", "SAD", "SURPRISED", "HYSTERIC", "ANGRY"].includes(data.type.toUpperCase())) {
            error.type = "HAPPY, SAD, SURPRISED, HYSTERIC, and ANGRY are only valid react types";
        }
    }

    return error;
};

const getPopularNewsData = data => {
    const error = {};

    if (!["THIS_WEEK", "THIS_MONTH", "PREVIOUS_WEEK", "PREVIOUS_MONTH"].includes(data.period.toUpperCase())) {
        error.period = "THIS_WEEK, THIS_MONTH, PREVIOUS_WEEK, and PREVIOUS_MONTH are only valid period types for route parameter";
    }

    if (!Validator.isBoolean(data.isCategoryWise.toString())) {
        error.isCategoryWise = "True and false are only valid route parameter for isCategoryWise";
    }

    if (!Validator.isNumeric(data.threshold.toString())) {
        error.threshold = "Only numeric value is supported for route parameter threshold";
    }

    return error;
};


const getSearchSuggestionsData = (data) => {
    const error = {};
    if (Validator.trim(data.searchTerm).length < 6) {
        error.searchTerm = "Route parameter, search term must be greater then 5 characters";
    }

    if (!Validator.isNumeric(data.limit.toString())) {
        error.limit = "Route parameter limit must be numeric character";
    }

    return error;
};

const addNewSliderImageData = data => {
    const error = {};
    if (!data.file) {
        error.image = "Image for the slider is required";
    }

    if (data.visibility && !Validator.isBoolean(data.visibility)) { 
        error.visibility = "Image visibility must be a boolean value";
    }

    return error;
}

const deleteSliderImageData = data => {
    const error = {};
    if (!Validator.isMongoId(data.imageSliderID)) {
        error.imageSliderID = "Provide valid id for route parameter imageSliderID";
    }
    return error;
}

const toggleSliderImageVisibilityData = data => {
    const error = {};
    if (!Validator.isMongoId(data.imageSliderID)) {
        error.imageSliderID = "Provide valid id for route parameter imageSliderID";
    }
    return error;
}

export { addUserData, uniqueUserData, updateUserRoleData, loginData, updateUserData, addCategoryData, getCategoryData, deleteCategoryData, updateCategoryData, addNewsData, getNewsParams, getBackendNewsParams, updateNewsData, deleteNewsData, addCommentData, updateCommentData, deleteCommentData, increaseNewsViewData, toggleCommentApproveData, postCommentReactData, postNewsReactData, getPopularNewsData, getSearchSuggestionsData, addNewSliderImageData, deleteSliderImageData, toggleSliderImageVisibilityData };