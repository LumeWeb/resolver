"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Resolver: () => Resolver,
  default: () => src_default,
  getSld: () => getSld,
  getTld: () => getTld,
  isDomain: () => isDomain,
  isIp: () => isIp,
  normalizeDomain: () => normalizeDomain,
  normalizeSkylink: () => normalizeSkylink,
  registryEntryRegExp: () => registryEntryRegExp,
  startsWithSkylinkRegExp: () => startsWithSkylinkRegExp,
});
module.exports = __toCommonJS(src_exports);

// src/resolver.ts
var import_dht_rpc_client = require("@lumeweb/dht-rpc-client");
var Resolver = class {
  _resolvers = [];
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
  async resolve(input, params = {}, force = false) {
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
};

// src/lib/util.ts
var import_libskynet = require("libskynet");
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
async function normalizeSkylink(skylink, resolver) {
  skylink = skylink.toString();
  let matches = skylink.match(startsWithSkylinkRegExp);
  if (matches) {
    if ((0, import_libskynet.validSkylink)(matches[2])) {
      return decodeURIComponent(matches[2]);
    }
  }
  matches = skylink.match(registryEntryRegExp);
  if (matches) {
    const pubKey = decodeURIComponent(matches.groups.publickey).replace(
      "ed25519:",
      ""
    );
    return (0, import_libskynet.bufToB64)(
      await getRegistryEntry(
        (0, import_libskynet.hexToBuf)(pubKey)[0],
        (0, import_libskynet.hexToBuf)(matches.groups.datakey)[0]
      )
    );
  }
  return false;
}
function getTld(domain) {
  if (domain.includes(".")) {
    domain = domain.split(".")[domain.split(".").length - 1];
  }
  return domain;
}
function getSld(domain) {
  if (domain.includes(".")) {
    domain = domain
      .split(".")
      .slice(0, domain.split(".").length - 1)
      .join(".");
  }
  return domain;
}
async function getRegistryEntry(pubkey, datakey) {
  if (
    typeof process === "undefined" ||
    !(process == null ? void 0 : process.platform)
  ) {
    if (
      typeof window !== "undefined" &&
      (window == null ? void 0 : window.document)
    ) {
      return (
        await Promise.resolve().then(() => __toESM(require("libkernel"), 1))
      )
        .registryRead(pubkey, datakey)
        .then((result) => result[0].entryData);
    }
    return (
      await Promise.resolve().then(() => __toESM(require("libkmodule"), 1))
    )
      .registryRead(pubkey, datakey)
      .then((result) => result[0].entryData);
  }
  const libskynetnode = await Promise.resolve().then(() =>
    __toESM(require("libskynetnode"), 1)
  );
  return new Promise((resolve, reject) => {
    const pubkeyHex = (0, import_libskynet.bufToHex)(pubkey);
    const datakeyHex = (0, import_libskynet.bufToHex)(datakey);
    const endpoint =
      "/skynet/registry?publickey=ed25519%3A" +
      pubkeyHex +
      "&datakey=" +
      datakeyHex;
    const verifyFunc = (response) =>
      (0, import_libskynet.verifyRegistryReadResponse)(
        response,
        pubkey,
        datakey
      );
    libskynetnode
      .progressiveFetch(
        endpoint,
        {},
        import_libskynet.defaultPortalList,
        verifyFunc
      )
      .then((result) => {
        if (result.success === true) {
          result.response
            .json()
            .then((j) => {
              resolve(j.data);
            })
            .catch((err) => {
              reject(
                (0, import_libskynet.addContextToErr)(
                  err,
                  "unable to parse response despite passing verification"
                )
              );
            });
          return;
        }
        for (let i = 0; i < result.responsesFailed.length; i++) {
          if (result.responsesFailed[i].status === 404) {
            resolve(new Uint8Array(0));
            return;
          }
        }
        reject("unable to read registry entry\n" + JSON.stringify(result));
      });
  });
}

// src/subResolverBase.ts
var SubResolverBase = class {
  resolver;
  constructor(resolver) {
    this.resolver = resolver;
  }
  getSupportedTlds() {
    return [];
  }
  isTldSupported(domain) {
    return this.getSupportedTlds().includes(getTld(domain));
  }
};

// src/resolvers/handshake.ts
var import_tld_enum = __toESM(require("@lumeweb/tld-enum"), 1);
var ethers = __toESM(require("ethers"), 1);
var Handshake = class extends SubResolverBase {
  tldBlacklist = [];
  constructor(resolver) {
    super(resolver);
    for (const subresolver of resolver.resolvers) {
      this.tldBlacklist = [
        ...this.tldBlacklist,
        ...subresolver.getSupportedTlds(),
      ];
    }
  }
  async resolve(input, params = {}, force = false) {
    const tld = getTld(input);
    if (this.tldBlacklist.includes(tld)) {
      return false;
    }
    if (isIp(input)) {
      return false;
    }
    if ("subquery" in params) {
      return false;
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
        case "GLUE4": {
          result = await this.processGlue(input, record, force);
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
      return this.processGlue(domain, record, force);
    }
    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;
    let isEvmAddress = false;
    if (
      foundDomain.split(".").length >= 2 &&
      ethers.utils.isAddress(foundDomain.split(".")[0])
    ) {
      isEvmAddress = true;
    }
    if (
      (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) &&
      !isEvmAddress
    ) {
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
  async processGlue(domain, record, force) {
    if (isDomain(record.ns) && isIp(record.address)) {
      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: record.address,
        },
        force
      );
    }
    return false;
  }
  async query(tld, force) {
    const query = this.resolver.rpcNetwork.query(
      "getnameresource",
      "hns",
      [tld],
      force
    );
    const resp = await query.result;
    return (resp == null ? void 0 : resp.records) || [];
  }
  async processTxt(record) {
    const content = record.txt.slice().pop();
    const skylink = await normalizeSkylink(content, this.resolver);
    if (skylink) {
      return skylink;
    }
    return content;
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
    const query = this.resolver.rpcNetwork.query(
      "dnslookup",
      "icann",
      data,
      force
    );
    return query.result;
  }
};

// src/resolvers/eip137.ts
var import_ethers = require("ethers");

// src/data/pocketNetworks.ts
var pocketNetworks = {
  "algorand-mainnet": "29",
  "algorand-archival": "000D",
  "algorand-testnet": "45",
  "algorand-testnet-archival": "0A45",
  "arweave-mainnet": "30",
  "avax-mainnet": "3",
  "avax-archival": "00A3",
  "avax-fuji": "000E",
  "bsc-mainnet": "4",
  "bsc-archival": "10",
  "bsc-testnet": "11",
  "bsc-testnet-archival": "12",
  "btc-mainnet": "2",
  "eth-mainnet": "21",
  "eth-archival": "22",
  "eth-archival-trace": "28",
  "eth-goerli": "26",
  "poa-kovan": "24",
  "eth-rinkeby": "25",
  "eth-ropsten": "23",
  "evmos-mainnet": "46",
  "fuse-mainnet": "5",
  "fuse-archival": "000A",
  "gnosischain-mainnet": "27",
  "gnosischain-archival": "000C",
  "harmony-0": "40",
  "harmony-0-archival": "0A40",
  "harmony-1": "41",
  "harmony-1-archival": "0A41",
  "harmony-2": "42",
  "harmony-2-archival": "0A42",
  "harmony-3": "43",
  "harmony-3-archival": "0A43",
  "iotex-mainnet": "44",
  "oec-mainnet": "47",
  mainnet: "1",
  "poly-mainnet": "9",
  "poly-archival": "000B",
  "poly-mumbai": "000F",
  "poly-mumbai-archival": "00AF",
  "sol-mainnet": "6",
  "sol-testnet": "31",
};
var pocketNetworks_default = pocketNetworks;

// src/resolvers/eip137/rpcProvider.ts
var ethers2 = __toESM(require("ethers"), 1);
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
    ethers2.ethers.logger.throwError(
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
    ethers2.ethers.logger.throwError(
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
    ethers2.logger.throwError(
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
    ethers2.logger.throwError(
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
    ethers2.logger.throwError(
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
    ethers2.logger.throwError(
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
var RpcProvider = class extends ethers2.providers.BaseProvider {
  _dnsChain;
  _rpcNetwork;
  _force;
  constructor(dnsChain, dnsNetwork, force = false) {
    const networkOrReady = { name: "dummy", chainId: 0 };
    super(networkOrReady);
    this._dnsChain = dnsChain;
    this._rpcNetwork = dnsNetwork;
    this._force = force;
  }
  async detectNetwork() {
    return { name: "dummy", chainId: 0 };
  }
  async send(method, params) {
    const query = this._rpcNetwork.query(
      method,
      this._dnsChain,
      params,
      this._force
    );
    return query.result;
  }
  prepareRequest(method, params) {
    switch (method) {
      case "call": {
        const hexlifyTransaction = ethers2.utils.getStatic(
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
      if (tx && tx.type != null && ethers2.BigNumber.from(tx.type).isZero()) {
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
    return new RpcSigner({}, this, addressOrIndex);
  }
};
var RpcSigner = class extends ethersAbstractSigner.Signer {
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
    return ethers2.logger.throwError(
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
        ethers2.logger.throwError(
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
          ethers2.logger.throwArgumentError(
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
          ethers2.logger.throwArgumentError(
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
    return ethers2.logger.throwError(
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

// src/resolvers/eip137/resolver.ts
var import_ensjs = __toESM(require("@lumeweb/ensjs"), 1);
var ENS = import_ensjs.default.default;
var networkMap = {
  eth: "eth-mainnet",
};
var Resolver2 = class extends SubResolverBase {
  getConnection(params = {}, force) {
    let chain = this.getChain(params);
    if (chain in networkMap) {
      chain = networkMap[chain];
    }
    if (chain in pocketNetworks_default) {
      chain = pocketNetworks_default[chain];
    }
    return new RpcProvider(chain, this.resolver.rpcNetwork, force);
  }
  getEns(provider) {
    return new ENS({
      provider,
      ensAddress: (0, import_ensjs.getEnsAddress)(1),
    });
  }
  async resolve(input, params = {}, force = false) {
    if (this.isTldSupported(input)) {
      return this.resolve137(input, params, force);
    }
    return false;
  }
  async resolve137(input, params = {}, force = false) {
    var _a;
    const ens =
      (_a = params.ens) != null
        ? _a
        : this.getEns(this.getConnection(params, force));
    try {
      const name = await ens.name(input);
      const content = maybeGetContentHash(await name.getContent());
      let result = false;
      if (content) {
        result = content;
      }
      const skylink = await normalizeSkylink(result, this.resolver);
      if (skylink) {
        return skylink;
      }
      return result;
    } catch (e) {
      return false;
    }
  }
};
function maybeGetContentHash(contentResult) {
  let content = false;
  if (
    typeof contentResult === "object" &&
    "contenthash" === contentResult.contentType
  ) {
    content = contentResult.value;
  }
  return content;
}

// src/resolvers/eip137.ts
var Eip137 = class extends Resolver2 {
  getSupportedTlds() {
    return ["eth"];
  }
  async resolve(input, params = {}, force = false) {
    let resolve = await super.resolve(input, params, force);
    if (!resolve) {
      const hip5Data = input.split(".");
      if (2 <= hip5Data.length && "domain" in params) {
        if (import_ethers.ethers.utils.isAddress(hip5Data[0])) {
          resolve = this.resolveHip5(params.domain, hip5Data, force);
        }
      }
    }
    return resolve;
  }
  async resolveHip5(domain, params = {}, data, force = false) {
    params.chain = data[1].replace("_", "");
    const ens = this.getEns(this.getConnection(params, force));
    try {
      const name = await ens.name(domain);
      const content = maybeGetContentHash(name.getContent());
      let result = false;
      if (content) {
        result = content;
      }
      const skylink = await normalizeSkylink(result, this.resolver);
      if (skylink) {
        return skylink;
      }
      return result;
    } catch (e) {
      return false;
    }
  }
  getChain(params) {
    if (params.chain) {
      return params.chain;
    }
    return "eth";
  }
};

// src/resolvers/solana.ts
var import_spl_name_service = require("@bonfida/spl-name-service");
var import_web32 = require("@solana/web3.js");

// src/resolvers/solana/connection.ts
var import_web3 = require("@solana/web3.js");
var Connection = class extends import_web3.Connection {
  _network;
  _force;
  constructor(network, force = false) {
    super("http://0.0.0.0");
    this._force = force;
    this._network = network;
    this._rpcWebSocket.removeAllListeners();
    this._rpcRequest = this.__rpcRequest;
  }
  async __rpcRequest(methodName, args) {
    const req = this._network.query(
      methodName,
      pocketNetworks_default["sol-mainnet"],
      args,
      this._force
    );
    return req.result;
  }
};

// src/resolvers/solana.ts
var import_borsh = require("borsh");
var SOL_TLD_AUTHORITY = new import_web32.PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);
var Solana = class extends SubResolverBase {
  async resolve(input, params, force) {
    var _a;
    if (!this.isTldSupported(input)) {
      return false;
    }
    const hashedName = await (0, import_spl_name_service.getHashedName)(
      getSld(input)
    );
    const domainKey = await (0, import_spl_name_service.getNameAccountKey)(
      hashedName,
      void 0,
      SOL_TLD_AUTHORITY
    );
    const connection = new Connection(this.resolver.rpcNetwork, force);
    const nameAccount = await connection.getAccountInfo(domainKey, "processed");
    if (!nameAccount) {
      return false;
    }
    const res = (0, import_borsh.deserializeUnchecked)(
      import_spl_name_service.NameRegistryState.schema,
      import_spl_name_service.NameRegistryState,
      nameAccount.data
    );
    res.data =
      (_a = nameAccount.data) == null
        ? void 0
        : _a.slice(import_spl_name_service.NameRegistryState.HEADER_LEN);
    let content = res.data.toString("ascii").replace(/\0/g, "");
    let skylink = await normalizeSkylink(content, this.resolver);
    if (skylink) {
      return skylink;
    }
    if (content.includes("=")) {
      content = content.split("=")[0];
    }
    skylink = await normalizeSkylink(content, this.resolver);
    if (skylink) {
      return skylink;
    }
    return content;
  }
  getSupportedTlds() {
    return ["sol"];
  }
};

// src/resolvers/algorand/client.ts
var import_algosdk = __toESM(require("algosdk"), 1);
var HTTPClientImport = __toESM(
  require("algosdk/dist/cjs/src/client/client.js"),
  1
);
var { default: HTTPClient } = HTTPClientImport.default;
function getAcceptFormat(query) {
  if (
    query !== void 0 &&
    Object.prototype.hasOwnProperty.call(query, "format")
  ) {
    switch (query.format) {
      case "msgpack":
        return "application/msgpack";
      case "json":
      default:
        return "application/json";
    }
  } else {
    return "application/json";
  }
}
function tolowerCaseKeys(o) {
  return Object.keys(o).reduce((c, k) => ((c[k.toLowerCase()] = o[k]), c), {});
}
var Client = class extends import_algosdk.default.Algodv2 {
  _force;
  _network;
  c;
  constructor(network, force = false) {
    super("http://0.0.0.0");
    this._network = network;
    this._force = force;
    this.c = this;
  }
  async post(relativePath, data, requestHeaders) {
    const format = getAcceptFormat();
    const fullHeaders = {
      "content-type": "application/json",
      ...tolowerCaseKeys(requestHeaders),
    };
    const req = this._network.query(
      "algorand_rest_request",
      pocketNetworks_default["algorand-mainnet"],
      {
        method: "POST",
        endpoint: relativePath,
        data: HTTPClient.serializeData(data, requestHeaders),
        fullHeaders,
      },
      this._force
    );
    const body = await req.result;
    const text = void 0;
    return {
      body,
      text,
      ok: true,
    };
  }
};

// src/resolvers/algorand/indexer.ts
var import_algosdk2 = __toESM(require("algosdk"), 1);
function removeFalsyOrEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!obj[key] || obj[key].length === 0) delete obj[key];
    }
  }
  return obj;
}
var Indexer = class extends import_algosdk2.default.Indexer {
  _force;
  _network;
  c;
  constructor(network, force = false) {
    super("http://0.0.0.0");
    this._network = network;
    this._force = force;
    this.c = this;
  }
  async get(relativePath, query, requestHeaders, jsonOptions) {
    const format = getAcceptFormat(query);
    const fullHeaders = { ...requestHeaders, accept: format };
    const req = this._network.query(
      "algorand_rest_indexer_request",
      "algorand-mainnet-indexer",
      {
        method: "GET",
        endpoint: relativePath,
        query: removeFalsyOrEmpty(query),
        fullHeaders,
      },
      this._force
    );
    const body = await req.result;
    const text = void 0;
    return {
      body,
      text,
      ok: true,
    };
  }
};

// src/resolvers/algorand.ts
var import_sdk = __toESM(require("@algonameservice/sdk"), 1);
var Algorand = class extends SubResolverBase {
  getSupportedTlds() {
    return ["algo"];
  }
  async resolve(input, params, force) {
    if (!this.isTldSupported(input)) {
      return false;
    }
    const client = new Client(this.resolver.rpcNetwork, force);
    const indexer = new Indexer(this.resolver.rpcNetwork, force);
    const resolver = new import_sdk.default(client, indexer);
    const domain = resolver.name(input);
    let record;
    try {
      record = await domain.getContent();
    } catch (e) {
      record = false;
    }
    const skylink = await normalizeSkylink(record, this.resolver);
    if (skylink) {
      return skylink;
    }
    if (!record) {
      try {
        record = await domain.getText("ipaddress");
      } catch (e) {
        record = false;
      }
    }
    return record;
  }
};

// src/resolvers/avax.ts
var import_client3 = __toESM(require("@avvy/client"), 1);
var Avax = class extends SubResolverBase {
  getSupportedTlds() {
    return ["avax"];
  }
  async resolve(input, params, force) {
    if (!this.isTldSupported(input)) {
      return false;
    }
    const connection = new RpcProvider(
      pocketNetworks_default["avax-mainnet"],
      this.resolver.rpcNetwork,
      force
    );
    const domain = new import_client3.default(connection).name(input);
    let content = false;
    let skylink = false;
    try {
      content = await domain.resolve(import_client3.default.RECORDS.CONTENT);
    } catch (e) {}
    if (content) {
      skylink = await normalizeSkylink(content, this.resolver);
    }
    if (skylink) {
      return skylink;
    }
    if (content) {
      return content;
    }
    let record = false;
    try {
      record = await domain.resolve(import_client3.default.RECORDS.DNS_CNAME);
    } catch (e) {}
    if (!record) {
      try {
        record = await domain.resolve(import_client3.default.RECORDS.DNS_A);
      } catch (e) {}
    }
    return record;
  }
};

// src/resolvers/evmos.ts
var import_ensjs2 = __toESM(require("@lumeweb/ensjs"), 1);
var ENS2 = import_ensjs2.default.default;
var Evmos = class extends Resolver2 {
  getEns(provider) {
    return new ENS2({
      provider,
      ensAddress: "0xae9Da235A2276CAa3f6484ad8F0EFbF4e0d45246",
    });
  }
  getSupportedTlds() {
    return ["evmos"];
  }
  getChain(params) {
    return pocketNetworks_default["evmos-mainnet"];
  }
};

// src/index.ts
var resolvers = {
  Icann,
  Eip137,
  Solana,
  Algorand,
  Avax,
  Evmos,
  Handshake,
  createDefaultResolver: (network) => {
    const defaultResolver = new Resolver(network);
    defaultResolver.registerResolver(new Icann(defaultResolver));
    defaultResolver.registerResolver(new Eip137(defaultResolver));
    defaultResolver.registerResolver(new Solana(defaultResolver));
    defaultResolver.registerResolver(new Algorand(defaultResolver));
    defaultResolver.registerResolver(new Avax(defaultResolver));
    defaultResolver.registerResolver(new Evmos(defaultResolver));
    defaultResolver.registerResolver(new Handshake(defaultResolver));
    return defaultResolver;
  },
};
var src_default = resolvers;
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    Resolver,
    getSld,
    getTld,
    isDomain,
    isIp,
    normalizeDomain,
    normalizeSkylink,
    registryEntryRegExp,
    startsWithSkylinkRegExp,
  });
//# sourceMappingURL=index.cjs.map
