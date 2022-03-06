import { isDomain } from "../lib/util.js";
import resolver from "../index.js";

// @ts-ignore
import { NodeClient } from "@lumeweb/hs-client";
import SubResolverBase from "../SubResolverBase.js";
import HnsClient from "./handshake/HnsClient.js";

export default class Icann extends SubResolverBase {
  async resolve(input: string, params: object = {}): Promise<string | boolean> {
    // @ts-ignore
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }

    if (!isDomain(input)) {
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
    let resp: object | boolean = false;
    try {
      const rpcParams = {};

      // @ts-ignore
      rpcParams.domain = params.domain || input;
      // @ts-ignore
      rpcParams.nameserver = !params.domain ? null : input;

      // noinspection TypeScriptValidateJSTypes,JSVoidFunctionReturnValueUsed
      resp = await client.execute("dnslookup", rpcParams);
    } catch (e) {
      return false;
    }

    // @ts-ignore
    return resp.result.pop();
  }
}
