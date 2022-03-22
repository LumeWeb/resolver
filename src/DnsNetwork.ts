import Resolver, { Portal } from "./Resolver.js";
import DnsQuery from "./DnsQuery.js";
// @ts-ignore
import Gun from "@lumeweb/gun";
import { EventEmitter } from "events";
import { clearTimeout, setTimeout, setInterval } from "timers";
export default class DnsNetwork extends EventEmitter {
  // @ts-ignore
  private _network: Gun;
  private _resolver: Resolver;
  private _peers: string[] = [];
  private _user: object = {};
  private _peerTimeout = 5000;
  private _queryTimeout = 30000;
  private _majorityThreshold = 0.75;
  private _maxTtl = 12 * 60 * 60;
  private _activePeers: { [pubkey: string]: number } = {};
  private _authed: Promise<any>;

  constructor(resolver: Resolver) {
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

  get maxTtl(): number {
    return this._maxTtl;
  }

  set maxTtl(value: number) {
    this._maxTtl = value;
  }

  get queryTimeout(): number {
    return this._queryTimeout;
  }

  set queryTimeout(value: number) {
    this._queryTimeout = value;
  }

  get majorityThreshold(): number {
    return this._majorityThreshold;
  }

  get network() {
    return this._network;
  }

  get resolver(): Resolver {
    return this._resolver;
  }

  get peers(): string[] {
    return this._peers;
  }

  get user(): object {
    return this._user;
  }

  get peerTimeout(): number {
    return this._peerTimeout;
  }

  set peerTimeout(value: number) {
    this._peerTimeout = value;
  }

  get activePeers(): { [pubkey: string]: number } {
    return this._activePeers;
  }

  async auth() {
    const keyPair = await Gun.SEA.pair();
    await this.promiseRetry((resolve: () => void) => {
      this._network.user().create(keyPair, resolve);
    });
    await this.promiseRetry((resolve: () => void) => {
      this._network.user().auth(keyPair, resolve);
    });

    this._user = this._network.user();
  }

  public addTrustedPeer(peer: string) {
    this._peers.push(peer);
    this._peers = [...new Set(this._peers)];

    this.network.opt({ peers: [`https://${peer}/dns`] });
    this._trackPeerHealth(peer);
  }

  public query(
    query: string,
    chain: string,
    data: object | any[] = {}
  ): DnsQuery {
    return new DnsQuery(this, { query, chain, data });
  }

  private _trackPeerHealth(peerDomain: string) {
    const peer: Portal = this._resolver.getPortal(peerDomain) as Portal;
    this._network
      .user(peer.pubkey)
      .get("ping")
      .on(this.getPeerPingHandler(peer.pubkey as string));
  }

  private getPeerPingHandler(pubkey: string): (value: number) => void {
    return (value: number) => {
      if (!(pubkey in this._activePeers)) {
        this.emit("newActivePeer", pubkey);
      }
      this._activePeers[pubkey] = value;
      this.pruneDeadPeers();
    };
  }

  private pruneDeadPeers(): void {
    for (const peer in this._activePeers) {
      if (Date.now() - this._activePeers[peer] > this._peerTimeout) {
        delete this._activePeers[peer];
      }
    }
  }

  public async waitForPeers(count = 1): Promise<void> {
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

  // tslint:disable-next-line:ban-types
  private promiseRetry(callback: Function) {
    let timer: NodeJS.Timeout;

    return new Promise<void>((resolve) => {
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
