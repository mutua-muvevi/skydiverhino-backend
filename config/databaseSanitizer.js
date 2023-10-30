/**
 * ## MongoDB Sanitizer Middleware
 * 
 * Sanitizes user input to protect against NoSQL injection attacks.
 *
 * ### Procedure:
 * 1. Iterate over the request's query, body, and params.
 * 2. If any value is an object with a `$` sign in its properties, delete it.
 * 
 */
const isInvalidMongoDBPayload = (payload) => {
    return typeof payload === 'object' && payload !== null && '$' in payload;
};

const databaseSanitizer = (req, res, next) => {
    ['query', 'body', 'params'].forEach((location) => {
        for (let prop in req[location]) {
            if (isInvalidMongoDBPayload(req[location][prop])) {
                delete req[location][prop];
            }
        }
    });

    next();
};

module.exports = databaseSanitizer;