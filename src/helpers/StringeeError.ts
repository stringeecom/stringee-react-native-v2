/**
 * Error rejected by Promise-based SDK operations.
 * Positive codes originate from Stringee services; negative codes are produced
 * locally by the bridge or TypeScript layer. `name` identifies the operation.
 */
class StringeeError extends Error {
  code: number;
  constructor(code: number, message: string, name = '') {
    super(message);
    this.name = name;
    this.code = code;
  }

  override toString(): string {
    return `Stringee Error | function: ${this.name}, code: ${this.code}, message: ${this.message}`;
  }
}

export {StringeeError};
