"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ResolverRegistry: () => ResolverRegistry,
});
module.exports = __toCommonJS(src_exports);

// src/resolverRegistry.ts
var import_dht_rpc_client = require("@lumeweb/dht-rpc-client");
var import_resolver_common = require("@lumeweb/resolver-common");
var ResolverRegistry = class {
  _resolvers = /* @__PURE__ */ new Set();
  _rpcNetwork;
  constructor(network = new import_dht_rpc_client.RpcNetwork()) {
    this._rpcNetwork = network;
  }
  get resolvers() {
    return this._resolvers;
  }
  get rpcNetwork() {
    return this._rpcNetwork;
  }
  async resolve(
    domain,
    options = { type: import_resolver_common.DNS_RECORD_TYPE.DEFAULT },
    bypassCache = false
  ) {
    for (const resolver of this._resolvers) {
      const result = await resolver.resolve(domain, options, bypassCache);
      if (!result.error && result.records.length) {
        return result;
      }
    }
    return { records: [] };
  }
  register(resolver) {
    this._resolvers.add(resolver);
  }
  clear() {
    this._resolvers.clear();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    ResolverRegistry,
  });
//# sourceMappingURL=index.cjs.map
