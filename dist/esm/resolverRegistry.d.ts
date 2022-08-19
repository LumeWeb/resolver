import { RpcNetwork } from "@lumeweb/dht-rpc-client";
import { DNSResult, ResolverModule, ResolverOptions } from "@lumeweb/resolver-common";
export declare class ResolverRegistry {
    private _resolvers;
    private _rpcNetwork;
    constructor(network?: RpcNetwork);
    get resolvers(): Set<ResolverModule>;
    get rpcNetwork(): RpcNetwork;
    resolve(domain: string, options?: ResolverOptions, bypassCache?: boolean): Promise<DNSResult>;
    register(resolver: ResolverModule): void;
    clear(): void;
}
//# sourceMappingURL=resolverRegistry.d.ts.map