import SubResolverBase from "./subResolverBase.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export default class Resolver {
  private _resolvers;
  private _rpcNetwork;
  constructor(network?: RpcNetwork);
  get resolvers(): SubResolverBase[];
  get rpcNetwork(): RpcNetwork;
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  registerResolver(resolver: SubResolverBase): void;
}
//# sourceMappingURL=resolver.d.ts.map
