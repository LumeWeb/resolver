import { isDomain } from "../lib/util.js";
// @ts-ignore
import SubResolverBase from "../SubResolverBase.js";
export default class Icann extends SubResolverBase {
  async resolve(input, params = {}, force = false) {
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }
    if (!isDomain(input) && !("nameserver" in params || !params.nameserver)) {
      return false;
    }
    const data = {
      domain: input,
      nameserver: params.nameserver ?? undefined,
    };
    const query = this.resolver.dnsNetwork.query(
      "dnslookup",
      "icann",
      data,
      force
    );
    return query.promise;
  }
}
