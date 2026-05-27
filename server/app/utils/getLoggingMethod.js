const HttpStatus = require('http-status');


const getLoggingMethod = (status) => {
    let loggingMethod = 'info';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        loggingMethod = 'error';
    }
    else if (status >= HttpStatus.BAD_REQUEST) {
        loggingMethod = 'warn';
    }

    return loggingMethod;
};


module.exports = {
    getLoggingMethod
};