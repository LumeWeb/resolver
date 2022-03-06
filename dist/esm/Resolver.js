export default class Resolver {
  _resolvers = [];
  _portals = [];
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
  registerPortal(hostname) {
    this._portals.push(hostname);
  }
  set portals(value) {
    this._portals = value;
  }
  getPortal() {
    return this._portals[
      Math.floor(Math.random() * (1 + this._portals.length - 1))
    ];
  }
}
