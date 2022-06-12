import Resolver from "./eip137/resolver.js";
import GunProvider from "./eip137/gunprovider.js";
export default class Evmos extends Resolver {
  protected getEns(provider: GunProvider): any;
  getSupportedTlds(): string[];
  protected getChain(params: { [p: string]: any }): string;
}
//# sourceMappingURL=evmos.d.ts.map
