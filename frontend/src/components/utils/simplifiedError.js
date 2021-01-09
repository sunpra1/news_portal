const simplifiedError = (errorObject, keysToBeIgnored) => {
    
    let errorString;
    const errorKeys = Object.keys(errorObject);
    if (errorKeys.length > 0) {
        errorKeys.forEach((key, index) => {
            if (keysToBeIgnored.includes(key)) {
                delete errorObject[key];
            } else {
                if (index === 0) {
                    errorString = errorObject[key];
                } else if (index < errorKeys.length - 1) {
                    errorString += errorObject[key] + "\n";
                } else {
                    errorString += errorObject[key];
                }
            }
        });
    }
    return { errorObject, errorString };
};

export { simplifiedError };