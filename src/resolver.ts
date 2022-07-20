import SubResolverBase from "./subResolverBase.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";

export default class Resolver {
  private _resolvers: SubResolverBase[] = [];
  private _rpcNetwork: RpcNetwork;

  constructor(network: RpcNetwork = new RpcNetwork()) {
    this._rpcNetwork = network;
  }

  get resolvers(): SubResolverBase[] {
    return this._resolvers;
  }

  get rpcNetwork(): RpcNetwork {
    return this._rpcNetwork;
  }

  public async resolve(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(input, params, force);
      if (result) {
        return result;
      }
    }

    return false;
  }

  public registerResolver(resolver: SubResolverBase): void {
    this._resolvers.push(resolver);
  }
}
