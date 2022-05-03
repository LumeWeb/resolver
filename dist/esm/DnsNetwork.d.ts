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
  private _forceTimeout;
  private _majorityThreshold;
  private _maxTtl;
  private _activePeers;
  private _authed;
  private _force;
  private _maxConnectedPeers;
  constructor(resolver: Resolver);
  get maxConnectedPeers(): number;
  set maxConnectedPeers(value: number);
  get force(): boolean;
  set force(value: boolean);
  get forceTimeout(): number;
  set forceTimeout(value: number);
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
  query(
    query: string,
    chain: string,
    data?: object | any[],
    force?: boolean
  ): DnsQuery;
  waitForPeers(count?: number): Promise<void>;
  connectToPeers(): void;
  private _trackPeerHealth;
  private getPeerPingHandler;
  private pruneDeadPeers;
  private promiseRetry;
}
//# sourceMappingURL=DnsNetwork.d.ts.map
