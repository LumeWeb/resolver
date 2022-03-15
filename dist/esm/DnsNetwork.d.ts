import Resolver from "./Resolver.js";
import DnsQuery from "./DnsQuery.js";
export default class DnsNetwork {
  private _network;
  private _resolver;
  private _peers;
  private _user;
  private _peerTimeout;
  private _queryTimeout;
  private _majorityThreshold;
  private _maxTtl;
  private _activePeers;
  constructor(resolver: Resolver);
  auth(): Promise<void>;
  get maxTtl(): number;
  set maxTtl(value: number);
  get queryTimeout(): number;
  set queryTimeout(value: number);
  get majorityThreshold(): number;
  get network(): any;
  get resolver(): Resolver;
  get peers(): string[];
  get user(): object;
  get peerTimeout(): number;
  set peerTimeout(value: number);
  get activePeers(): {
    [pubkey: string]: number;
  };
  addTrustedPeer(peer: string): void;
  query(query: string, chain: string, data?: object | any[]): Promise<DnsQuery>;
  private _trackPeerHealth;
  private _getPeerPingHandler;
  private _pruneDeadPeers;
}
//# sourceMappingURL=DnsNetwork.d.ts.map
