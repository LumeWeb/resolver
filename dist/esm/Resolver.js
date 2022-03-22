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
  async resolve(input, params, force = false) {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(input, params, force);
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
  getPortals(supports = [], mode = "and") {
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
          if (mode === "and") {
            delete portals[portalDomain];
          }
        }
      }
    }
    return portals;
  }
  getRandomPortal(supports = [], mode = "and") {
    const portals = this.getPortals(supports, mode);
    const portalDomains = Object.keys(portals);
    if (!portalDomains.length) {
      return false;
    }
    const randPortalDomainIndex = Math.floor(
      Math.random() * (1 + portalDomains.length - 1)
    );
    return portals[portalDomains[randPortalDomainIndex]];
  }
}
