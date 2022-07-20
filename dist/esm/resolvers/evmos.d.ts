import Resolver from "./eip137/resolver.js";
import RpcProvider from "./eip137/rpcProvider.js";
export default class Evmos extends Resolver {
  protected getEns(provider: RpcProvider): any;
  getSupportedTlds(): string[];
  protected getChain(params: { [p: string]: any }): string;
}
//# sourceMappingURL=evmos.d.ts.map
