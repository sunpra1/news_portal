
const getSimplifiedError = error => {
    const response = {};
    if (error.kind == "ObjectId" && error.name == "CastError") {
        response.statusCode = 400;
        response.message = "Provided Id is invalid";
    } else if (error.name == "MongoError" && error.code == 11000) {
        response.statusCode = 400;
        response.message = "Dublicate value provided for unique field";
    } else if (error.reason && error.reason.code && error.reason.code == "ERR_ASSERTION") {
        response.statusCode = 400;
        response.message = `Field "${error.path}" expects "${error.kind}" but provided ${error.value}`;
    } else {
        response.statusCode = error.statusCode ? error.statusCode : 500;
        response.message = error.message ? error.message : "Internal server error";
    }
    return response;
};

export { getSimplifiedError };