var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) =>
  __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, copyDefault, desc) => {
  if (
    (module2 && typeof module2 === "object") ||
    typeof module2 === "function"
  ) {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, {
          get: () => module2[key],
          enumerable:
            !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable,
        });
  }
  return target;
};
var __toESM = (module2, isNodeMode) => {
  return __reExport(
    __markAsModule(
      __defProp(
        module2 != null ? __create(__getProtoOf(module2)) : {},
        "default",
        !isNodeMode && module2 && module2.__esModule
          ? { get: () => module2.default, enumerable: true }
          : { value: module2, enumerable: true }
      )
    ),
    module2
  );
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return (
      (cache && cache.get(module2)) ||
      ((temp = __reExport(__markAsModule({}), module2, 1)),
      cache && cache.set(module2, temp),
      temp)
    );
  };
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Resolver: () => Resolver,
  default: () => src_default,
  isDomain: () => isDomain,
  isIp: () => isIp,
  normalizeDomain: () => normalizeDomain,
  registryEntryRegExp: () => registryEntryRegExp,
  startsWithSkylinkRegExp: () => startsWithSkylinkRegExp,
});

// src/Resolver.ts
var Resolver = class {
  _resolvers = [];
  _portals = [];
  async resolve(input, params = []) {
    for (const resolver2 of this._resolvers) {
      const result = await resolver2.resolve(input, params);
      if (result) {
        return result;
      }
    }
    return false;
  }
  registerResolver(resolver2) {
    this._resolvers.push(resolver2);
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
};

// src/lib/util.ts
function isIp(ip) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
}
function isDomain(domain) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
    domain
  );
}
var startsWithSkylinkRegExp = /^(sia:\/\/)?([a-zA-Z0-9_-]{46})/;
var registryEntryRegExp =
  /^skyns:\/\/(?<publickey>[a-zA-Z0-9%]+)\/(?<datakey>[a-zA-Z0-9%]+)$/;
function normalizeDomain(domain) {
  return domain.replace(/^\.+|\.+$/g, "").replace(/^\/+|\/+$/g, "");
}

// src/resolvers/handshake/HnsClient.ts
var import_path = require("path");
var import_brq = __toESM(require("brq"), 1);
var import_assert = __toESM(require("assert"), 1);
var import_hs_client = require("@lumeweb/hs-client");

// src/resolvers/handshake/RPCError.ts
var RPCError = class extends Error {
  constructor(msg, code) {
    super();
    this.type = "RPCError";
    this.message = String(msg);
    this.code = code >> 0;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RPCError);
    }
  }
};

// src/resolvers/handshake/HnsClient.ts
var HnsClient = class extends import_hs_client.NodeClient {
  constructor(options) {
    super(options);
  }
  async execute(name, params) {
    var _a;
    (0, import_assert.default)(typeof name === "string");
    this.sequence += 1;
    const chain = (_a = this.headers["x-chain"]) != null ? _a : "hns";
    const res = await (0, import_brq.default)({
      method: "POST",
      ssl: true,
      strictSSL: this.strictSSL,
      host: this.host,
      port: this.port,
      path: import_path.posix.join(this.path, "/rpc"),
      username: this.username,
      password: this.password,
      headers: this.headers,
      timeout: this.timeout,
      limit: this.limit,
      pool: true,
      query: {
        chain,
      },
      json: {
        jsonrpc: "2.0",
        method: name,
        params,
        id: this.sequence,
      },
    });
    if (res.statusCode === 401) {
      throw new RPCError("Unauthorized (bad API key).", -1);
    }
    if (res.type !== "json") {
      throw new Error("Bad response (wrong content-type).");
    }
    const json = res.json();
    if (!json) {
      throw new Error("No body for JSON-RPC response.");
    }
    if (json.error) {
      const { message, code } = json.error;
      throw new RPCError(message, code);
    }
    if (res.statusCode !== 200) {
      throw new Error(`Status code: ${res.statusCode}.`);
    }
    return json;
  }
};

// src/resolvers/handshake.ts
var import_skynet_js = require("@lumeweb/skynet-js");

// src/SubResolverBase.ts
var SubResolverBase = class {
  resolver;
  constructor(resolver2) {
    this.resolver = resolver2;
  }
};

// src/resolvers/handshake.ts
var import_tld_enum = __toESM(require("@lumeweb/tld-enum"), 1);
var Handshake = class extends SubResolverBase {
  async resolve(input, params = {}) {
    let tld = input;
    if (isIp(input)) {
      return false;
    }
    if (input.endsWith(".eth")) {
      return false;
    }
    if ("subquery" in params) {
      return false;
    }
    if (input.includes(".")) {
      tld = input.split(".")[input.split(".").length - 1];
    }
    const records = await this.query(tld);
    if (!records) {
      return false;
    }
    let result = false;
    for (const record of records.reverse()) {
      switch (record.type) {
        case "NS": {
          result = await this.processNs(input, record, records);
          break;
        }
        case "TXT": {
          result = await this.processTxt(record);
          break;
        }
        case "SYNTH6": {
          if ("ipv6" in params && params.ipv6) {
            result = record.address;
          }
          break;
        }
        case "SYNTH4": {
          result = record.address;
          break;
        }
        default: {
          break;
        }
      }
      if (result) {
        break;
      }
    }
    return result;
  }
  async processNs(domain, record, records) {
    const glue = records
      .slice()
      .find(
        (item) =>
          ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns
      );
    if (glue) {
      return this.resolver.resolve(domain, {
        subquery: true,
        nameserver: glue.address,
      });
    }
    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;
    if (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) {
      if (foundDomain.includes(".")) {
        const tld = foundDomain.split(".")[foundDomain.split(".").length - 1];
        isIcann = import_tld_enum.default.list.includes(tld);
      }
      if (!isIcann) {
        const hnsNs = await this.resolver.resolve(foundDomain);
        if (hnsNs) {
          return this.resolver.resolve(domain, {
            subquery: true,
            nameserver: hnsNs,
          });
        }
      }
      return this.resolver.resolve(domain, {
        subquery: true,
        nameserver: foundDomain,
      });
    }
    const result = await this.resolver.resolve(record.ns, { domain });
    return result || record.ns;
  }
  async query(tld) {
    var _a;
    const portal = this.resolver.getPortal();
    const clientOptions = {
      ssl: true,
      network: "main",
      host: portal,
      port: 443,
      headers: {
        "x-chain": "hns",
      },
    };
    const client = new HnsClient(clientOptions);
    let resp;
    try {
      resp = await client.execute("getnameresource", [tld]);
    } catch (e) {
      return false;
    }
    return (
      ((_a = resp == null ? void 0 : resp.result) == null
        ? void 0
        : _a.records) || []
    );
  }
  async processTxt(record) {
    var _a;
    let matches = record.txt.slice().pop().match(startsWithSkylinkRegExp);
    if (matches) {
      return decodeURIComponent(matches[2]);
    }
    matches = record.txt.slice().pop().match(registryEntryRegExp);
    if (matches) {
      const client = new import_skynet_js.SkynetClient(
        `https://${this.resolver.getPortal()}`
      );
      const pubKey = decodeURIComponent(matches.groups.publickey).replace(
        "ed25519:",
        ""
      );
      const entry = await client.registry.getEntry(
        pubKey,
        matches.groups.datakey,
        { hashedDataKeyHex: true }
      );
      return Buffer.from(
        (_a = entry.entry) == null ? void 0 : _a.data
      ).toString();
    }
    return false;
  }
};

// src/resolvers/icann.ts
var Icann = class extends SubResolverBase {
  async resolve(input, params = {}) {
    var _a;
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }
    if (!isDomain(input) && !("nameserver" in params || !params.nameserver)) {
      return false;
    }
    const portal = src_default.getPortal();
    const clientOptions = {
      ssl: true,
      host: portal,
      port: 443,
      path: "/pocketdns",
      headers: {
        "x-chain": "icann",
      },
    };
    const client = new HnsClient(clientOptions);
    let resp = false;
    try {
      const rpcParams = {};
      rpcParams.domain = input;
      rpcParams.nameserver = (_a = params.nameserver) != null ? _a : void 0;
      resp = await client.execute("dnslookup", rpcParams);
    } catch (e) {
      return false;
    }
    return resp.result;
  }
};

// src/resolvers/eip137.ts
var import_ensjs = __toESM(require("@lumeweb/ensjs"), 1);
var import_ethers = require("ethers");
var import_url = __toESM(require("url"), 1);
var ENS = import_ensjs.default.default;
var Eip137 = class extends SubResolverBase {
  async resolve(input, params = {}) {
    if (input.endsWith(".eth")) {
      return this.resolveEns(input);
    }
    const hip5Data = input.split(".");
    if (2 <= hip5Data.length && "domain" in params) {
      if (import_ethers.ethers.utils.isAddress(hip5Data[0])) {
        return this.resolveHip5(params.domain, hip5Data);
      }
    }
    return false;
  }
  async resolveEns(input) {
    const data = [(0, import_ensjs.getEnsAddress)("1"), "eth-mainnet"];
    return this.resolveHip5(input, data);
  }
  async resolveHip5(domain, data) {
    const connection = this.getConnection(data[1].replace("_", ""));
    const ens = new ENS({ provider: connection, ensAddress: data[0] });
    try {
      const name = await ens.name(domain);
      const contentResult = await name.getContent();
      const url = await name.getText("url");
      let content;
      if (typeof contentResult === "string" && Number(contentResult) === 0) {
        content = false;
      }
      if (
        typeof contentResult === "object" &&
        contentResult.contentType === "contenthash"
      ) {
        content = contentResult.value;
      }
      return content || url || false;
    } catch (e) {
      return false;
    }
  }
  getConnection(chain) {
    const apiUrl = new import_url.default.parse(
      `https://${this.resolver.getPortal()}/pocketdns`
    );
    if (import_url.default.URLSearchParams) {
      const params = new import_url.default.URLSearchParams();
      params.set("chain", chain);
      apiUrl.search = params.toString();
    } else {
      apiUrl.search = `?chain=${chain}`;
    }
    return new import_ethers.ethers.providers.StaticJsonRpcProvider({
      url: apiUrl.format(),
    });
  }
};

// src/index.ts
var resolver = new Resolver();
resolver.registerResolver(new Icann(resolver));
resolver.registerResolver(new Eip137(resolver));
resolver.registerResolver(new Handshake(resolver));
var src_default = resolver;
module.exports = __toCommonJS(src_exports);
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    Resolver,
    isDomain,
    isIp,
    normalizeDomain,
    registryEntryRegExp,
    startsWithSkylinkRegExp,
  });
//# sourceMappingURL=index.cjs.map
