import DnsNetwork from "./DnsNetwork.js";
export default class Resolver {
  _resolvers = [];
  _portals = {};
  _dnsNetwork;
  constructor() {
    this._dnsNetwork = new DnsNetwork(this);
  }
  get dnsNetwork() {
    return this._dnsNetwork;
  }
  async resolve(input, params = []) {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(input, params);
      if (result) {
        return result;
      }
    }
    return false;
  }
  registerResolver(resolver) {
    this._resolvers.push(resolver);
  }
  registerPortal(host, supports, pubkey) {
    this._portals[host] = { pubkey, supports, host };
    if (supports.includes("dns") && pubkey && pubkey.length > 0) {
      this._dnsNetwork.addTrustedPeer(host);
    }
  }
  getPortal(hostname) {
    if (hostname in this._portals) {
      return this._portals[hostname];
    }
    return false;
  }
  getPortals(supports = []) {
    const portals = {};
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
  getRandomPortal(supports = []) {
    const portals = this.getPortals(supports);
    const portalDomains = Object.keys(portals);
    const randPortalDomainIndex = Math.floor(
      Math.random() * (1 + portalDomains.length - 1)
    );
    return portals[portalDomains[randPortalDomainIndex]];
  }
}
