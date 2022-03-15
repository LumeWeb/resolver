import { isDomain } from "../lib/util.js";

// @ts-ignore
import { NodeClient } from "@lumeweb/hs-client";
import SubResolverBase from "../SubResolverBase.js";

export default class Icann extends SubResolverBase {
  async resolve(input: string, params: object = {}): Promise<string | boolean> {
    // @ts-ignore
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }

    // @ts-ignore
    if (!isDomain(input) && !("nameserver" in params || !params.nameserver)) {
      return false;
    }

    const data = {
      domain: input,
      // @ts-ignore
      nameserver: params.nameserver ?? undefined,
    };

    const query = this.resolver.dnsNetwork.query("dnslookup", "icann", data);

    return query.promise;
  }
}
