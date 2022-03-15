import SubResolverBase from "./SubResolverBase.js";
import DnsNetwork from "./DnsNetwork.js";

export type PortalList = {
  [domain: string]: Portal;
};

export type Portal = {
  pubkey?: string;
  supports: string[];
  host: string;
};

export default class Resolver {
  private _resolvers: SubResolverBase[] = [];
  private _portals: PortalList = {};
  private _dnsNetwork: any;

  constructor() {
    this._dnsNetwork = new DnsNetwork(this);
  }

  get dnsNetwork(): DnsNetwork {
    return this._dnsNetwork;
  }

  public async resolve(
    input: string,
    params: object = []
  ): Promise<string | boolean> {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(input, params);
      if (result) {
        return result;
      }
    }

    return false;
  }

  public registerResolver(resolver: SubResolverBase): void {
    this._resolvers.push(resolver);
  }

  public registerPortal(
    host: string,
    supports: string[],
    pubkey?: string
  ): void {
    this._portals[host] = { pubkey, supports, host };

    if (supports.includes("dns") && pubkey && pubkey.length > 0) {
      this._dnsNetwork.addTrustedPeer(host);
    }
  }

  public getPortal(hostname: string): Portal | boolean {
    if (hostname in this._portals) {
      return this._portals[hostname];
    }
    return false;
  }
  public getPortals(supports: string[] | string = []): PortalList {
    const portals: PortalList = {};

    if (!Array.isArray(supports)) {
      supports = [supports];
    }

    // tslint:disable-next-line:forin
    for (const service of supports) {
      // tslint:disable-next-line:forin
      for (const portalDomain in this._portals) {
        const portal = this._portals[portalDomain];
        if (this._portals[portalDomain].supports.includes(service)) {
          portals[portalDomain] = portal;
        } else {
          delete portals[portalDomain];
        }
      }
    }

    return portals;
  }

  public getRandomPortal(supports: string[] | string = []): Portal {
    const portals = this.getPortals(supports);

    const portalDomains = Object.keys(portals);
    const randPortalDomainIndex = Math.floor(
      Math.random() * (1 + portalDomains.length - 1)
    );

    return portals[portalDomains[randPortalDomainIndex]];
  }
}
