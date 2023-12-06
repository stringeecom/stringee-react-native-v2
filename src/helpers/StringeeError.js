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
  constructor(code, message, name) {
    super(message);
    this.name = name;
    this.code = code;
  }

  toString(): string {
    return `Stringee Error | function: ${this.name}, code: ${this.code}, message: ${this.message}`;
  }
}

export {StringeeError};
