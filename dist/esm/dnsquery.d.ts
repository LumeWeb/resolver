import DnsNetwork from "./dnsnetwork.js";
export declare type DnsResponse = {
  updated: number;
  requests: number;
  data: object | string | boolean | null;
};
export declare type DnsRequest = {
  query: string;
  chain: string;
  data: object | any[] | string;
  force?: boolean;
};
export default class DnsQuery {
  private _network;
  private _query;
  private _requestId?;
  private _responses;
  private _handlers;
  private _cachedHandler;
  private _timeoutTimer?;
  private _timeout;
  private _promise?;
  private _promiseResolve?;
  private _cachedResponses;
  private _cacheChecked;
  private _cachedTimers;
  private _requestSent;
  private _completed;
  constructor(network: DnsNetwork, query: DnsRequest);
  get promise(): Promise<any>;
  private init;
  private getCachedRecordHandler;
  private getResponseHandler;
  private pruneDeadPeers;
  private checkResponses;
  private handeTimeout;
  private resolve;
  private cleanHandlers;
  private fetch;
  private hasResponseExpired;
  private retry;
  private sendRequest;
  private fetchPeer;
  private addPeer;
  private isInvalidResponse;
}
//# sourceMappingURL=dnsquery.d.ts.map
