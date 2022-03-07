import { isDomain } from "../lib/util.js";
import resolver from "../index.js";
import SubResolverBase from "../SubResolverBase.js";
import HnsClient from "./handshake/HnsClient.js";
export default class Icann extends SubResolverBase {
  async resolve(input, params = {}) {
    // @ts-ignore
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }
    // @ts-ignore
    if (!isDomain(input) && !("nameserver" in params || !params.nameserver)) {
      return false;
    }
    const portal = resolver.getPortal();
    const clientOptions = {
      ssl: true,
      host: portal,
      port: 443,
      path: "/pocketdns",
      headers: {
        "x-chain": "icann",
      },
    };
    const client = new HnsClient(clientOptions);
    let resp = false;
    try {
      const rpcParams = {};
      // @ts-ignore
      rpcParams.domain = input;
      // @ts-ignore
      rpcParams.nameserver = params.nameserver ?? undefined;
      // noinspection TypeScriptValidateJSTypes,JSVoidFunctionReturnValueUsed
      resp = await client.execute("dnslookup", rpcParams);
    } catch (e) {
      return false;
    }
    // @ts-ignore
    return resp.result;
  }
}
