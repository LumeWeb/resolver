import { RpcNetwork } from "@lumeweb/dht-rpc-client";
import {
  DNSResult,
  ResolverModule,
  ResolverOptions,
} from "@lumeweb/resolver-common";
export default class ResolverRegistry {
  private _resolvers;
  private _rpcNetwork;
  constructor(network?: RpcNetwork);
  get resolvers(): ResolverModule[];
  get rpcNetwork(): RpcNetwork;
  resolve(
    domain: string,
    options?: ResolverOptions,
    bypassCache?: boolean
  ): Promise<DNSResult>;
  register(resolver: ResolverModule): void;
}
//# sourceMappingURL=resolverRegistry.d.ts.map
