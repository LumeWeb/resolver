import { posix as Path } from "path";
// @ts-ignore
import brq from "brq";
import assert from "assert";
import { NodeClient } from "@lumeweb/hs-client";
import RPCError from "./RPCError.js";
export default class HnsClient extends NodeClient {
  constructor(options) {
    super(options);
  }
  async execute(name, params) {
    // async execute(endpoint: string, method: string, params: any) {
    // @ts-ignore
    assert(typeof name === "string");
    this.sequence += 1;
    // @ts-ignore
    const chain = this.headers["x-chain"] ?? "hns";
    const res = await brq({
      method: "POST",
      ssl: true,
      strictSSL: this.strictSSL,
      host: this.host,
      port: this.port,
      path: Path.join(this.path, "/rpc"),
      username: this.username,
      password: this.password,
      headers: this.headers,
      timeout: this.timeout,
      limit: this.limit,
      pool: true,
      query: {
        chain,
      },
      json: {
        jsonrpc: "2.0",
        method: name,
        params,
        id: this.sequence,
      },
    });
    if (res.statusCode === 401) {
      throw new RPCError("Unauthorized (bad API key).", -1);
    }
    if (res.type !== "json") {
      throw new Error("Bad response (wrong content-type).");
    }
    const json = res.json();
    if (!json) {
      throw new Error("No body for JSON-RPC response.");
    }
    if (json.error) {
      const { message, code } = json.error;
      throw new RPCError(message, code);
    }
    if (res.statusCode !== 200) {
      throw new Error(`Status code: ${res.statusCode}.`);
    }
    return json;
  }
}
