import DnsQuery from "./DnsQuery.js";
// @ts-ignore
import Gun from "@lumeweb/gun";
import { EventEmitter } from "events";
import { clearTimeout, setTimeout, setInterval } from "timers";
export default class DnsNetwork extends EventEmitter {
  // @ts-ignore
  _network;
  _resolver;
  _peers = [];
  _user = {};
  _peerTimeout = 5;
  _queryTimeout = 30;
  _forceTimeout = 10;
  _majorityThreshold = 0.75;
  _maxTtl = 12 * 60 * 60;
  _activePeers = {};
  _authed;
  _force = false;
  _maxConnectedPeers = 10;
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
  get maxConnectedPeers() {
    return this._maxConnectedPeers;
  }
  set maxConnectedPeers(value) {
    this._maxConnectedPeers = value;
  }
  get force() {
    return this._force;
  }
  set force(value) {
    this._force = value;
  }
  get forceTimeout() {
    return this._forceTimeout;
  }
  set forceTimeout(value) {
    this._forceTimeout = value;
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
    this._trackPeerHealth(peer);
  }
  query(query, chain, data = {}, force = false) {
    return new DnsQuery(this, {
      query,
      chain,
      data,
      force: force || this._force,
    });
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
  connectToPeers() {
    const mesh = this._network.back("opt.mesh");
    const currentPeers = this._network.back("opt.peers");
    Object.keys(currentPeers).forEach((id) => mesh.bye(id));
    const peers = [];
    let availablePeers = this._peers.slice();
    for (let i = 0; i < this._maxConnectedPeers; i++) {
      const index = Math.floor(Math.random() * (1 + availablePeers.length - 1));
      if (availablePeers[index]) {
        peers.push(`http://${availablePeers[index]}/dns`);
        delete availablePeers[index];
        availablePeers = Object.values(availablePeers);
      }
      if (!availablePeers.length) {
        break;
      }
    }
    peers.forEach((item) => mesh.hi({ url: item }));
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
      if (Date.now() - this._activePeers[peer] > this._peerTimeout * 1000) {
        delete this._activePeers[peer];
      }
    }
  }
  // tslint:disable-next-line:ban-types
  promiseRetry(callback) {
    let timer;
    return new Promise((resolve) => {
      timer = setTimeout(() => {
        resolve(this.promiseRetry(callback));
      }, 100);
      callback(() => {
        // tslint:disable-next-line:no-unused-expression
        timer && clearTimeout(timer);
        resolve();
      });
    });
  }
}
