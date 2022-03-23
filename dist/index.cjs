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
  default: () => src_default,
  isDomain: () => isDomain,
  isIp: () => isIp,
  normalizeDomain: () => normalizeDomain,
  registryEntryRegExp: () => registryEntryRegExp,
  startsWithSkylinkRegExp: () => startsWithSkylinkRegExp,
});

// src/DnsQuery.ts
var import_crypto = __toESM(require("crypto"), 1);
var import_timers = require("timers");
var import_uuid = require("uuid");
var import_gun_util = require("gun-util");
var DnsQuery = class {
  _network;
  _query;
  _requestId;
  _responses = {};
  _handlers = {};
  _cachedHandler = {};
  _timeoutTimer;
  _timeout = false;
  _promise;
  _promiseResolve;
  _cachedResponses = {};
  _cacheChecked = false;
  _cachedTimers = {};
  constructor(network, query) {
    this._network = network;
    this._query = query;
    this.init();
  }
  get promise() {
    return this._promise;
  }
  async init() {
    var _a, _b, _c;
    const hash = import_crypto.default
      .createHash("sha256")
      .update(JSON.stringify(this._query.data))
      .digest("hex");
    if (this._query.force) {
      this._query.force = true;
    }
    this._requestId =
      (_a = this._requestId) != null
        ? _a
        : `${this._query.query};${this._query.chain};${hash}`;
    this._promise =
      (_b = this._promise) != null
        ? _b
        : new Promise((resolve) => {
            this._promiseResolve = resolve;
          });
    if (this._query.force) {
      this._cacheChecked = true;
    }
    this.addPeer = this.addPeer.bind(this);
    this._network.on("newActivePeer", this.addPeer);
    await this._network.waitForPeers();
    Object.keys(this._network.activePeers).forEach((peer) =>
      this.addPeer(peer)
    );
    this._timeoutTimer =
      (_c = this._timeoutTimer) != null
        ? _c
        : (0, import_timers.setTimeout)(
            this.handeTimeout.bind(this),
            this._network.queryTimeout
          );
  }
  _getResponseHandler(pubkey) {
    return (value) => {
      this._responses[pubkey] = this.hasResponseExpired(value) ? null : value;
      this.pruneDeadPeers();
      this.checkResponses();
    };
  }
  pruneDeadPeers() {
    for (const peer in this._responses) {
      if (!(peer in this._network.activePeers)) {
        delete this._responses[peer];
      }
    }
  }
  checkResponses(cached = false) {
    var _a;
    const responses = {};
    const responseStore = cached ? this._cachedResponses : this._responses;
    if (
      Object.keys(responseStore).length !==
      Object.keys(this._network.activePeers).length
    ) {
      return false;
    }
    const responseStoreKeys = Object.keys(responseStore);
    for (const peer in responseStore) {
      const responseIndex = responseStoreKeys.indexOf(peer);
      responses[responseIndex] =
        (_a = responses[responseIndex]) != null ? _a : 0;
      responses[responseIndex]++;
    }
    for (const responseIndex in responses) {
      if (responses[responseIndex] >= this._network.majorityThreshold) {
        const response =
          responseStore[responseStoreKeys[parseInt(responseIndex, 10)]];
        if (response === null) {
          if (!cached) {
            this.retry();
          }
          return false;
        }
        let data;
        try {
          data = JSON.parse(response == null ? void 0 : response.data);
        } catch (e) {
          data = response == null ? void 0 : response.data;
        }
        this.resolve(data);
        return true;
      }
    }
    return false;
  }
  handeTimeout() {
    this.resolve(false, true);
  }
  resolve(data, timeout = false) {
    this.cleanHandlers();
    (0, import_timers.clearTimeout)(this._timeoutTimer);
    this._timeout = timeout;
    this._promiseResolve(data);
  }
  cleanHandlers() {
    Object.keys(this._handlers).forEach((pubkey) => {
      this._handlers[pubkey].off();
      delete this._handlers[pubkey];
    });
    Object.values(this._cachedTimers).forEach((timer) => clearInterval(timer));
    this._cachedTimers = {};
    this._network.off("newActivePeer", this.addPeer);
    this._cachedHandler = {};
  }
  getCachedRecordHandler(pubkey) {
    return (response) => {
      if (pubkey in this._cachedResponses) {
        return;
      }
      if (response) {
        if (!this.hasResponseExpired(response)) {
          this._cachedResponses[pubkey] = response;
        }
      } else {
        this._cachedResponses[pubkey] = null;
      }
      const success = this.checkResponses(true);
      if (
        Object.keys(this._cachedResponses).length ===
          Object.keys(this._network.activePeers).length &&
        !success &&
        !this._timeout
      ) {
        this._cacheChecked = true;
        this.fetch();
      }
    };
  }
  fetch() {
    Object.keys(this._network.activePeers).forEach((peer) =>
      this.addPeer(peer, true)
    );
    const query = this._query;
    query.data = JSON.stringify(query.data);
    this.sendRequest(query);
  }
  hasResponseExpired(response) {
    return Date.now() - response.updated > this._network.maxTtl * 1e3;
  }
  retry() {
    this._cachedResponses = {};
    this._responses = {};
    this._cacheChecked = false;
    this.cleanHandlers();
    this.init();
  }
  sendRequest(query, id = (0, import_uuid.v4)(), count = 0) {
    if (this._timeout) {
      return;
    }
    if (count > 3) {
      id = (0, import_uuid.v4)();
      count = 0;
    } else {
      count++;
    }
    const timer = (0, import_timers.setTimeout)(() => {
      this.sendRequest(query, id, count);
    }, 100);
    this._network.network
      .get("requests")
      .get(id)
      .put(query, (ack) => {
        (0, import_timers.clearTimeout)(timer);
        if (ack.err) {
          this.sendRequest(query, id, count);
        }
      });
    this._network.network.get("requests").get(id, (data) => {
      (0, import_timers.clearTimeout)(timer);
      if (!data.put) {
        this.sendRequest(query, id, count);
      }
    });
  }
  async addPeer(pubkey, fromFetch = false) {
    await this._network.authed;
    if (!fromFetch && (this._cacheChecked || this._query.force)) {
      this.fetch();
    }
    if (
      !this._cacheChecked &&
      !(pubkey in this._cachedHandler) &&
      !this._query.force
    ) {
      this._cachedHandler[pubkey] = true;
      this._cachedTimers[pubkey] = (0, import_timers.setInterval)(() => {
        if (pubkey in this._cachedResponses) {
          clearInterval(this._cachedTimers[pubkey]);
          delete this._cachedTimers[pubkey];
          return;
        }
        this._network.network
          .user(pubkey)
          .get("responses")
          .get(this._requestId)
          .once(this.getCachedRecordHandler(pubkey), { wait: 100 });
      }, 100);
      return;
    }
    if (!(pubkey in this._handlers)) {
      const ref = this._network.network
        .user(pubkey)
        .get("responses")
        .get(this._requestId);
      this._handlers[pubkey] = (0, import_gun_util.subscribe)(
        ref,
        this._getResponseHandler(pubkey)
      );
    }
  }
};

// src/DnsNetwork.ts
var import_gun = __toESM(require("@lumeweb/gun"), 1);
var import_events = require("events");
var import_timers2 = require("timers");
var DnsNetwork = class extends import_events.EventEmitter {
  _network;
  _resolver;
  _peers = [];
  _user = {};
  _peerTimeout = 5e3;
  _queryTimeout = 3e4;
  _majorityThreshold = 0.75;
  _maxTtl = 12 * 60 * 60;
  _activePeers = {};
  _authed;
  constructor(resolver2) {
    super();
    this._resolver = resolver2;
    this._network = new import_gun.default({
      localStorage: false,
      store: import_gun.default.Rmem(),
      axe: false,
    });
    this._authed = this.auth();
  }
  get authed() {
    return this._authed;
  }
  get maxTtl() {
    return this._maxTtl;
  }
  set maxTtl(value) {
    this._maxTtl = value;
  }
  get queryTimeout() {
    return this._queryTimeout;
  }
  set queryTimeout(value) {
    this._queryTimeout = value;
  }
  get majorityThreshold() {
    return this._majorityThreshold;
  }
  get network() {
    return this._network;
  }
  get resolver() {
    return this._resolver;
  }
  get peers() {
    return this._peers;
  }
  get user() {
    return this._user;
  }
  get peerTimeout() {
    return this._peerTimeout;
  }
  set peerTimeout(value) {
    this._peerTimeout = value;
  }
  get activePeers() {
    return this._activePeers;
  }
  async auth() {
    const keyPair = await import_gun.default.SEA.pair();
    await this.promiseRetry((resolve) => {
      this._network.user().create(keyPair, resolve);
    });
    await this.promiseRetry((resolve) => {
      this._network.user().auth(keyPair, resolve);
    });
    this._user = this._network.user();
  }
  addTrustedPeer(peer) {
    this._peers.push(peer);
    this._peers = [...new Set(this._peers)];
    this.network.opt({ peers: [`https://${peer}/dns`] });
    this._trackPeerHealth(peer);
  }
  query(query, chain, data = {}, force = false) {
    return new DnsQuery(this, { query, chain, data, force });
  }
  _trackPeerHealth(peerDomain) {
    const peer = this._resolver.getPortal(peerDomain);
    this._network
      .user(peer.pubkey)
      .get("ping")
      .on(this.getPeerPingHandler(peer.pubkey));
  }
  getPeerPingHandler(pubkey) {
    return (value) => {
      if (!(pubkey in this._activePeers)) {
        this.emit("newActivePeer", pubkey);
      }
      this._activePeers[pubkey] = value;
      this.pruneDeadPeers();
    };
  }
  pruneDeadPeers() {
    for (const peer in this._activePeers) {
      if (Date.now() - this._activePeers[peer] > this._peerTimeout) {
        delete this._activePeers[peer];
      }
    }
  }
  async waitForPeers(count = 1) {
    const hasPeers = () => Object.values(this._activePeers).length >= count;
    if (hasPeers()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timer = (0, import_timers2.setInterval)(() => {
        if (hasPeers()) {
          clearInterval(timer);
          resolve();
        }
      }, 10);
    });
  }
  promiseRetry(callback) {
    let timer;
    return new Promise((resolve) => {
      timer = (0, import_timers2.setTimeout)(() => {
        resolve(this.promiseRetry(callback));
      }, 100);
      callback(() => {
        timer && (0, import_timers2.clearTimeout)(timer);
        resolve();
      });
    });
  }
};

// src/Resolver.ts
var Resolver = class {
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
    for (const resolver2 of this._resolvers) {
      const result = await resolver2.resolve(input, params, force);
      if (result) {
        return result;
      }
    }
    return false;
  }
  registerResolver(resolver2) {
    this._resolvers.push(resolver2);
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
    for (const service of supports) {
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
var b64ToBuf = (b64) => {
  const b64regex = /^[0-9a-zA-Z-_/+=]*$/;
  if (!b64regex.test(b64)) {
    return [null, null];
  }
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  const binStr = atob(b64);
  const len = binStr.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = binStr.charCodeAt(i);
  }
  return [buf, null];
};
var parseSkylinkBitfield = (skylink) => {
  if (skylink.length !== 34) {
    return [0, 0, 0, new Error("provided skylink has incorrect length")];
  }
  let bitfield = new DataView(skylink.buffer).getUint16(0, true);
  const version = (bitfield & 3) + 1;
  if (version !== 1 && version !== 2) {
    return [0, 0, 0, new Error("provided skylink has unrecognized version")];
  }
  bitfield = bitfield >> 2;
  if ((bitfield & 255) === 255) {
    return [0, 0, 0, new Error("provided skylink has an unrecognized version")];
  }
  let mode = 0;
  for (let i = 0; i < 8; i++) {
    if ((bitfield & 1) === 0) {
      bitfield = bitfield >> 1;
      break;
    }
    bitfield = bitfield >> 1;
    mode++;
  }
  if (mode > 7) {
    return [0, 0, 0, new Error("provided skylink has an invalid v1 bitfield")];
  }
  const offsetIncrement = 4096 << mode;
  let fetchSizeIncrement = 4096;
  if (mode > 0) {
    fetchSizeIncrement = fetchSizeIncrement << (mode - 1);
  }
  let fetchSizeBits = bitfield & 7;
  fetchSizeBits++;
  const fetchSize = fetchSizeBits * fetchSizeIncrement;
  bitfield = bitfield >> 3;
  const offset = bitfield * offsetIncrement;
  if (offset + fetchSize > 1 << 22) {
    return [0, 0, 0, new Error("provided skylink has an invalid v1 bitfield")];
  }
  return [version, offset, fetchSize, null];
};
var Handshake = class extends SubResolverBase {
  async resolve(input, params = {}, force = false) {
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
    const records = await this.query(tld, force);
    if (!records) {
      return false;
    }
    let result = false;
    for (const record of records.reverse()) {
      switch (record.type) {
        case "NS": {
          result = await this.processNs(input, record, records, force);
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
  async processNs(domain, record, records, force) {
    const glue = records
      .slice()
      .find(
        (item) =>
          ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns
      );
    if (glue) {
      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: glue.address,
        },
        force
      );
    }
    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;
    if (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) {
      if (foundDomain.includes(".")) {
        const tld = foundDomain.split(".")[foundDomain.split(".").length - 1];
        isIcann = import_tld_enum.default.list.includes(tld);
      }
      if (!isIcann) {
        const hnsNs = await this.resolver.resolve(foundDomain, { force });
        if (hnsNs) {
          return this.resolver.resolve(domain, {
            subquery: true,
            nameserver: hnsNs,
            force,
          });
        }
      }
      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: foundDomain,
        },
        force
      );
    }
    const result = await this.resolver.resolve(record.ns, { domain }, force);
    return result || record.ns;
  }
  async query(tld, force) {
    const query = this.resolver.dnsNetwork.query(
      "getnameresource",
      "hns",
      [tld],
      force
    );
    const resp = await query.promise;
    return (resp == null ? void 0 : resp.records) || [];
  }
  async processTxt(record) {
    var _a;
    let matches = record.txt.slice().pop().match(startsWithSkylinkRegExp);
    if (matches) {
      const [u8Link, err64] = b64ToBuf(matches[2]);
      if (err64 !== null) {
        return false;
      }
      if (u8Link.length !== 34) {
        return false;
      }
      const [version, offset, fetchSize, errBF] = parseSkylinkBitfield(u8Link);
      if (errBF !== null) {
        return false;
      }
      return decodeURIComponent(matches[2]);
    }
    matches = record.txt.slice().pop().match(registryEntryRegExp);
    if (matches) {
      const portal = this.resolver.getRandomPortal("registry");
      if (!portal) {
        return false;
      }
      const client = new import_skynet_js.SkynetClient(`https://${portal}`);
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
  async resolve(input, params = {}, force = false) {
    var _a;
    if (!params || !("subquery" in params) || !params.subquery) {
      return false;
    }
    if (!isDomain(input) && !("nameserver" in params || !params.nameserver)) {
      return false;
    }
    const data = {
      domain: input,
      nameserver: (_a = params.nameserver) != null ? _a : void 0,
    };
    const query = this.resolver.dnsNetwork.query(
      "dnslookup",
      "icann",
      data,
      force
    );
    return query.promise;
  }
};

// src/resolvers/eip137.ts
var import_ensjs = __toESM(require("@lumeweb/ensjs"), 1);
var import_ethers = require("ethers");

// src/resolvers/eip137/GunProvider.ts
var ethers = __toESM(require("ethers"), 1);
var ethersTransactions = __toESM(require("@ethersproject/transactions"), 1);
var ethersProperties = __toESM(require("@ethersproject/properties"), 1);
var ethersBytes = __toESM(require("@ethersproject/bytes"), 1);
var ethersLogger = __toESM(require("@ethersproject/logger"), 1);
var ethersAbstractSigner = __toESM(
  require("@ethersproject/abstract-signer"),
  1
);
var ethersStrings = __toESM(require("@ethersproject/strings"), 1);
var import_web = require("@ethersproject/web");
var import_hash = require("@ethersproject/hash");
var {
  defineReadOnly,
  resolveProperties,
  shallowCopy: shallowCopy2,
} = ethersProperties;
var { Logger: Logger2 } = ethersLogger;
var { toUtf8Bytes } = ethersStrings;
var { hexlify: hexlify2 } = ethersBytes;
var allowedTransactionKeys = {
  chainId: true,
  data: true,
  gasLimit: true,
  gasPrice: true,
  nonce: true,
  to: true,
  value: true,
  type: true,
  accessList: true,
  maxFeePerGas: true,
  maxPriorityFeePerGas: true,
};
var errorGas = ["call", "estimateGas"];
function checkError(method, error, params) {
  if (
    method === "call" &&
    error.code === ethersLogger.Logger.errors.SERVER_ERROR
  ) {
    const e = error.error;
    if (e && e.message.match("reverted") && ethersBytes.isHexString(e.data)) {
      return e.data;
    }
    ethers.ethers.logger.throwError(
      "missing revert data in call exception",
      ethersLogger.Logger.errors.CALL_EXCEPTION,
      {
        error,
        data: "0x",
      }
    );
  }
  let message = error.message;
  if (
    error.code === ethersLogger.Logger.errors.SERVER_ERROR &&
    error.error &&
    typeof error.error.message === "string"
  ) {
    message = error.error.message;
  } else if (typeof error.body === "string") {
    message = error.body;
  } else if (typeof error.responseText === "string") {
    message = error.responseText;
  }
  message = (message || "").toLowerCase();
  const transaction = params.transaction || params.signedTransaction;
  if (message.match(/insufficient funds|base fee exceeds gas limit/)) {
    ethers.ethers.logger.throwError(
      "insufficient funds for intrinsic transaction cost",
      ethersLogger.Logger.errors.INSUFFICIENT_FUNDS,
      {
        error,
        method,
        transaction,
      }
    );
  }
  if (message.match(/nonce too low/)) {
    ethers.logger.throwError(
      "nonce has already been used",
      ethersLogger.Logger.errors.NONCE_EXPIRED,
      {
        error,
        method,
        transaction,
      }
    );
  }
  if (message.match(/replacement transaction underpriced/)) {
    ethers.logger.throwError(
      "replacement fee too low",
      ethersLogger.Logger.errors.REPLACEMENT_UNDERPRICED,
      {
        error,
        method,
        transaction,
      }
    );
  }
  if (message.match(/only replay-protected/)) {
    ethers.logger.throwError(
      "legacy pre-eip-155 transactions not supported",
      ethersLogger.Logger.errors.UNSUPPORTED_OPERATION,
      {
        error,
        method,
        transaction,
      }
    );
  }
  if (
    errorGas.indexOf(method) >= 0 &&
    message.match(
      /gas required exceeds allowance|always failing transaction|execution reverted/
    )
  ) {
    ethers.logger.throwError(
      "cannot estimate gas; transaction may fail or may require manual gas limit",
      ethersLogger.Logger.errors.UNPREDICTABLE_GAS_LIMIT,
      {
        error,
        method,
        transaction,
      }
    );
  }
  throw error;
}
var GunProvider = class extends ethers.providers.BaseProvider {
  _dnsChain;
  _dnsNetwork;
  _force;
  constructor(dnsChain, dnsNetwork, force = false) {
    const networkOrReady = { name: "dummy", chainId: 0 };
    super(networkOrReady);
    this._dnsChain = dnsChain;
    this._dnsNetwork = dnsNetwork;
    this._force = force;
  }
  async detectNetwork() {
    return { name: "dummy", chainId: 0 };
  }
  async send(method, params) {
    const query = this._dnsNetwork.query(
      method,
      this._dnsChain,
      params,
      this._force
    );
    return query.promise;
  }
  prepareRequest(method, params) {
    switch (method) {
      case "call": {
        const hexlifyTransaction = ethers.utils.getStatic(
          this.constructor,
          "hexlifyTransaction"
        );
        return [
          "eth_call",
          [
            hexlifyTransaction(params.transaction, { from: true }),
            params.blockTag,
          ],
        ];
      }
      default:
        break;
    }
    return null;
  }
  async perform(method, params) {
    if (method === "call") {
      const tx = params.transaction;
      if (tx && tx.type != null && ethers.BigNumber.from(tx.type).isZero()) {
        if (tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null) {
          params = ethersProperties.shallowCopy(params);
          params.transaction = ethersProperties.shallowCopy(tx);
          delete params.transaction.type;
        }
      }
    }
    const args = this.prepareRequest(method, params);
    try {
      return await this.send(args[0], args[1]);
    } catch (error) {
      return checkError(method, error, params);
    }
  }
  static hexlifyTransaction(transaction, allowExtra) {
    const allowed = ethersProperties.shallowCopy(allowedTransactionKeys);
    if (allowExtra) {
      for (const key in allowExtra) {
        if (allowExtra[key]) {
          allowed[key] = true;
        }
      }
    }
    const result = {};
    [
      "gasLimit",
      "gasPrice",
      "type",
      "maxFeePerGas",
      "maxPriorityFeePerGas",
      "nonce",
      "value",
    ].forEach((key) => {
      if (transaction[key] == null) {
        return;
      }
      const value = ethersBytes.hexValue(transaction[key]);
      if (key === "gasLimit") {
        key = "gas";
      }
      result[key] = value;
    });
    ["from", "to", "data"].forEach((key) => {
      if (transaction[key] == null) {
        return;
      }
      result[key] = ethersBytes.hexlify(transaction[key]);
    });
    if (transaction.accessList) {
      result.accessList = ethersTransactions.accessListify(
        transaction.accessList
      );
    }
    return result;
  }
  getSigner(addressOrIndex) {
    return new GunSigner({}, this, addressOrIndex);
  }
};
var GunSigner = class extends ethersAbstractSigner.Signer {
  provider;
  _index;
  _address;
  constructor(provider, addressOrIndex) {
    super();
    defineReadOnly(this, "provider", provider);
    if (addressOrIndex == null) {
      addressOrIndex = 0;
    }
    if (typeof addressOrIndex === "string") {
      defineReadOnly(
        this,
        "_address",
        this.provider.formatter.address(addressOrIndex)
      );
      defineReadOnly(this, "_index", null);
    } else if (typeof addressOrIndex === "number") {
      defineReadOnly(this, "_index", addressOrIndex);
      defineReadOnly(this, "_address", null);
    }
  }
  connect(provider) {
    return ethers.logger.throwError(
      "cannot alter JSON-RPC Signer connection",
      Logger2.errors.UNSUPPORTED_OPERATION,
      {
        operation: "connect",
      }
    );
  }
  getAddress() {
    if (this._address) {
      return Promise.resolve(this._address);
    }
    return this.provider.send("eth_accounts", []).then((accounts) => {
      if (accounts.length <= this._index) {
        ethers.logger.throwError(
          "unknown account #" + this._index,
          Logger2.errors.UNSUPPORTED_OPERATION,
          {
            operation: "getAddress",
          }
        );
      }
      return this.provider.formatter.address(accounts[this._index]);
    });
  }
  sendUncheckedTransaction(transaction) {
    transaction = shallowCopy2(transaction);
    const fromAddress = this.getAddress().then((address) => {
      if (address) {
        address = address.toLowerCase();
      }
      return address;
    });
    if (transaction.gasLimit == null) {
      const estimate = shallowCopy2(transaction);
      estimate.from = fromAddress;
      transaction.gasLimit = this.provider.estimateGas(estimate);
    }
    if (transaction.to != null) {
      transaction.to = Promise.resolve(transaction.to).then(async (to) => {
        if (to == null) {
          return null;
        }
        const address = await this.provider.resolveName(to);
        if (address == null) {
          ethers.logger.throwArgumentError(
            "provided ENS name resolves to null",
            "tx.to",
            to
          );
        }
        return address;
      });
    }
    return resolveProperties({
      tx: resolveProperties(transaction),
      sender: fromAddress,
    }).then(({ tx, sender }) => {
      if (tx.from != null) {
        if (tx.from.toLowerCase() !== sender) {
          ethers.logger.throwArgumentError(
            "from address mismatch",
            "transaction",
            transaction
          );
        }
      } else {
        tx.from = sender;
      }
      const hexTx = this.provider.constructor.hexlifyTransaction(tx, {
        from: true,
      });
      return this.provider.send("eth_sendTransaction", [hexTx]).then(
        (hash) => {
          return hash;
        },
        (error) => {
          return checkError("sendTransaction", error, hexTx);
        }
      );
    });
  }
  signTransaction(transaction) {
    return ethers.logger.throwError(
      "signing transactions is unsupported",
      Logger2.errors.UNSUPPORTED_OPERATION,
      {
        operation: "signTransaction",
      }
    );
  }
  async sendTransaction(transaction) {
    const blockNumber = await this.provider._getInternalBlockNumber(
      100 + 2 * this.provider.pollingInterval
    );
    const hash = await this.sendUncheckedTransaction(transaction);
    try {
      return await (0, import_web.poll)(
        async () => {
          const tx = await this.provider.getTransaction(hash);
          if (tx === null) {
            return void 0;
          }
          return this.provider._wrapTransaction(tx, hash, blockNumber);
        },
        { oncePoll: this.provider }
      );
    } catch (error) {
      error.transactionHash = hash;
      throw error;
    }
  }
  async signMessage(message) {
    const data = typeof message === "string" ? toUtf8Bytes(message) : message;
    const address = await this.getAddress();
    return this.provider.send("personal_sign", [
      hexlify2(data),
      address.toLowerCase(),
    ]);
  }
  async _legacySignMessage(message) {
    const data = typeof message === "string" ? toUtf8Bytes(message) : message;
    const address = await this.getAddress();
    return this.provider.send("eth_sign", [
      address.toLowerCase(),
      hexlify2(data),
    ]);
  }
  async _signTypedData(domain, types, value) {
    const populated = await import_hash._TypedDataEncoder.resolveNames(
      domain,
      types,
      value,
      (name) => {
        return this.provider.resolveName(name);
      }
    );
    const address = await this.getAddress();
    return this.provider.send("eth_signTypedData_v4", [
      address.toLowerCase(),
      JSON.stringify(
        import_hash._TypedDataEncoder.getPayload(
          populated.domain,
          types,
          populated.value
        )
      ),
    ]);
  }
  async unlock(password) {
    const provider = this.provider;
    const address = await this.getAddress();
    return provider.send("personal_unlockAccount", [
      address.toLowerCase(),
      password,
      null,
    ]);
  }
};

// src/resolvers/eip137.ts
var ENS = import_ensjs.default.default;
var Eip137 = class extends SubResolverBase {
  async resolve(input, params = {}, force = false) {
    if (input.endsWith(".eth")) {
      return this.resolveEns(input, force);
    }
    const hip5Data = input.split(".");
    if (2 <= hip5Data.length && "domain" in params) {
      if (import_ethers.ethers.utils.isAddress(hip5Data[0])) {
        return this.resolveHip5(params.domain, hip5Data, force);
      }
    }
    return false;
  }
  async resolveEns(input, force = false) {
    const data = [(0, import_ensjs.getEnsAddress)("1"), "eth-mainnet"];
    return this.resolveHip5(input, data, force);
  }
  async resolveHip5(domain, data, force = false) {
    const chain = data[1].replace("_", "");
    const connection = new GunProvider(chain, this.resolver.dnsNetwork, force);
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
    isDomain,
    isIp,
    normalizeDomain,
    registryEntryRegExp,
    startsWithSkylinkRegExp,
  });
//# sourceMappingURL=index.cjs.map
