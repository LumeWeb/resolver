export default class RPCError extends Error {
  constructor(msg, code) {
    super();
    // @ts-ignore
    this.type = "RPCError";
    this.message = String(msg);
    // @ts-ignore
    // tslint:disable-next-line:no-bitwise
    this.code = code >> 0;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RPCError);
    }
  }
}
