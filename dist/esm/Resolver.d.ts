import SubResolverBase from "./SubResolverBase.js";
import DnsNetwork from "./DnsNetwork.js";
export declare type PortalList = {
  [domain: string]: Portal;
};
export declare type Portal = {
  pubkey?: string;
  supports: string[];
  host: string;
};
export default class Resolver {
  private _resolvers;
  private _portals;
  private _dnsNetwork;
  constructor();
  get dnsNetwork(): DnsNetwork;
  resolve(input: string, params?: object): Promise<string | boolean>;
  registerResolver(resolver: SubResolverBase): void;
  registerPortal(host: string, supports: string[], pubkey?: string): void;
  getPortal(hostname: string): Portal | boolean;
  getPortals(supports?: string[] | string, mode?: "and" | "or"): PortalList;
  getRandomPortal(
    supports?: string[] | string,
    mode?: "and" | "or"
  ): Portal | boolean;
}
//# sourceMappingURL=Resolver.d.ts.map
