
/**
 * Error response from stringee
 * @class StringeeError
 * @property {number} code 
 *  + code > 0 => Error received from the server.
    + code < 0 => Error received from the SDK.
 * @property {string} message message error
 */
class StringeeError extends Error {
    code;
    constructor(code, message) {
        this.name = 'Stringee Error'
        this.message = message
        this.code = code
    }
}

export default {StringeeError} 