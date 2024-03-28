class ExpressError extends Error {
    constructor(statusCode, message = 'An error occurred') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;

