import { RpcNetwork } from "@lumeweb/dht-rpc-client";
import {
  DNSResult,
  ResolverModule,
  ResolverOptions,
  DNS_RECORD_TYPE,
} from "@lumeweb/resolver-common";

export class ResolverRegistry {
  private _resolvers: Set<ResolverModule> = new Set();
  private _rpcNetwork: RpcNetwork;

  constructor(network: RpcNetwork = new RpcNetwork()) {
    this._rpcNetwork = network;
  }

  get resolvers(): Set<ResolverModule> {
    return this._resolvers;
  }

  get rpcNetwork(): RpcNetwork {
    return this._rpcNetwork;
  }

  public async resolve(
    domain: string,
    options: ResolverOptions = { type: DNS_RECORD_TYPE.DEFAULT },
    bypassCache: boolean = false
  ): Promise<DNSResult> {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(domain, options, bypassCache);
      if (!result.error && result.records.length) {
        return result;
      }
    }

    return { records: [] };
  }

  public register(resolver: ResolverModule): void {
    this._resolvers.add(resolver);
  }

  public clear(): void {
    this._resolvers.clear();
  }
}
