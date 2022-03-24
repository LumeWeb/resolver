import DnsNetwork from "./DnsNetwork.js";
export declare type DnsResponse = {
  updated: number;
  requests: number;
  data: object | string | boolean;
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
  constructor(network: DnsNetwork, query: DnsRequest);
  get promise(): Promise<any>;
  private init;
  private _getResponseHandler;
  private pruneDeadPeers;
  private checkResponses;
  private handeTimeout;
  private resolve;
  private cleanHandlers;
  private getCachedRecordHandler;
  private fetch;
  private hasResponseExpired;
  private retry;
  private sendRequest;
  private addPeer;
  private isInvalidResponse;
}
//# sourceMappingURL=DnsQuery.d.ts.map
