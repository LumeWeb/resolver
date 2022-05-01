import SubResolverBase from "./SubResolverBase.js";
import DnsNetwork from "./DnsNetwork.js";
export interface JSONPortalItem {
  pubkey?: string;
  supports: string[];
}
export interface JSONPortalList {
  [domain: string]: JSONPortalItem;
}
export interface Portal extends JSONPortalItem {
  host: string;
}
export interface PortalList {
  [domain: string]: Portal;
}
export default class Resolver {
  private _resolvers;
  private _portals;
  private _dnsNetwork;
  constructor();
  get resolvers(): SubResolverBase[];
  get dnsNetwork(): DnsNetwork;
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  registerResolver(resolver: SubResolverBase): void;
  registerPortal(host: string, supports: string[], pubkey?: string): void;
  registerPortalsFromJson(portals: JSONPortalList): void;
  connect(): void;
  getPortal(hostname: string): Portal | boolean;
  getPortals(supports?: string[] | string, mode?: "and" | "or"): PortalList;
  getRandomPortal(
    supports?: string[] | string,
    mode?: "and" | "or"
  ): Portal | boolean;
}
//# sourceMappingURL=Resolver.d.ts.map
