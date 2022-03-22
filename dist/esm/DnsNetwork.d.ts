/// <reference types="node" />
import Resolver from "./Resolver.js";
import DnsQuery from "./DnsQuery.js";
import { EventEmitter } from "events";
export default class DnsNetwork extends EventEmitter {
  private _network;
  private _resolver;
  private _peers;
  private _user;
  private _peerTimeout;
  private _queryTimeout;
  private _majorityThreshold;
  private _maxTtl;
  private _activePeers;
  private _authed;
  constructor(resolver: Resolver);
  get authed(): Promise<any>;
  get maxTtl(): number;
  set maxTtl(value: number);
  get queryTimeout(): number;
  set queryTimeout(value: number);
  get majorityThreshold(): number;
  get network(): Gun;
  get resolver(): Resolver;
  get peers(): string[];
  get user(): object;
  get peerTimeout(): number;
  set peerTimeout(value: number);
  get activePeers(): {
    [pubkey: string]: number;
  };
  auth(): Promise<void>;
  addTrustedPeer(peer: string): void;
  query(query: string, chain: string, data?: object | any[]): DnsQuery;
  private _trackPeerHealth;
  private getPeerPingHandler;
  private pruneDeadPeers;
  waitForPeers(count?: number): Promise<void>;
  private promiseRetry;
}
//# sourceMappingURL=DnsNetwork.d.ts.map
