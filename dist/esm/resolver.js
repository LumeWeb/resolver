import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export default class Resolver {
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
  async resolve(input, params = {}, force = false) {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(input, params, force);
      if (result) {
        return result;
      }
    }
    return false;
  }
  registerResolver(resolver) {
    this._resolvers.push(resolver);
  }
}
