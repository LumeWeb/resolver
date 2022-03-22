import DnsQuery from "./DnsQuery.js";
// @ts-ignore
import Gun from "@lumeweb/gun";
import { EventEmitter } from "events";
export default class DnsNetwork extends EventEmitter {
  // @ts-ignore
  _network;
  _resolver;
  _peers = [];
  _user = {};
  _peerTimeout = 5000;
  _queryTimeout = 30000;
  _majorityThreshold = 0.75;
  _maxTtl = 12 * 60 * 60;
  _activePeers = {};
  _authed;
  constructor(resolver) {
    super();
    this._resolver = resolver;
    this._network = new Gun({
      localStorage: false,
      store: Gun.Rmem(),
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
    const keyPair = await Gun.SEA.pair();
    await new Promise(async (resolve) =>
      this._network.user().create(keyPair, resolve)
    );
    await new Promise(async (resolve) =>
      this._network.user().auth(keyPair, resolve)
    );
    this._user = this._network.user();
  }
  addTrustedPeer(peer) {
    this._peers.push(peer);
    this._peers = [...new Set(this._peers)];
    this.network.opt({ peers: [`https://${peer}/dns`] });
    this._trackPeerHealth(peer);
  }
  query(query, chain, data = {}) {
    return new DnsQuery(this, { query, chain, data });
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
      const timer = setInterval(() => {
        if (hasPeers()) {
          clearInterval(timer);
          resolve();
        }
      }, 10);
    });
  }
}
