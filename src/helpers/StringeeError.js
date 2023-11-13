/**
 * Error response from stringee
 * @class StringeeError
 * @property {number} code
 *  + code > 0 => Error received from the server.
    + code < 0 => Error received from the SDK.
 * @property {string} message message error
 */
class StringeeError extends Error {
  code: number;
  constructor(code, message) {
    super(message);
    this.name = 'Stringee Error';
    this.code = code;
  }
}

export default {StringeeError};
