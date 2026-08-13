/** Host and port for a custom Stringee signaling endpoint. */
class StringeeServerAddress {
  host: string;
  port: number;
  constructor(host: string, port: number) {
    this.host = host;
    this.port = Number.isInteger(port) ? port : 0;
  }
}

export {StringeeServerAddress};
