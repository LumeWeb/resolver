import { RpcNetwork } from "@lumeweb/dht-rpc-client";
import { DNS_RECORD_TYPE } from "@lumeweb/resolver-common";
export default class ResolverRegistry {
  _resolvers = [];
  _rpcNetwork;
  constructor(network = new RpcNetwork()) {
    this._rpcNetwork = network;
  }
  get resolvers() {
    return this._resolvers;
  }
  get rpcNetwork() {
    return this._rpcNetwork;
  }
  async resolve(
    domain,
    options = { type: DNS_RECORD_TYPE.DEFAULT },
    bypassCache = false
  ) {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(domain, options, bypassCache);
      if (!result.error && result.records.length) {
        return result;
      }
    }
    return { records: [] };
  }
  register(resolver) {
    this._resolvers.push(resolver);
  }
}
