/**
 * Error response from stringee
 * @class StringeeError
 * @property {number} code
 *  + code > 0 => Error received from the server.
 + code < 0 => Error received from the SDK.
 * @property {string} message message error
 */
export class StringeeError extends Error {
    constructor(code: any, message: any, name: any);
    code: number;
    name: any;
}
