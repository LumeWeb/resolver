import DnsNetwork from "./dnsnetwork.js";
import crypto from "crypto";
import { Portal } from "./resolver.js";
import { clearTimeout, setTimeout, setInterval } from "timers";
import { v4 as uuidv4 } from "uuid";
import { IGunSubscription, subscribe } from "gun-util";

export type DnsResponse = {
  updated: number;
  requests: number;
  data: object | string | boolean | null;
};

export type DnsRequest = {
  query: string;
  chain: string;
  data: object | any[] | string;
  force?: boolean;
};

export default class DnsQuery {
  private _network: DnsNetwork;
  private _query: DnsRequest;
  private _requestId?: string;
  private _responses: { [peer: string]: DnsResponse | null } = {};
  private _handlers: { [peer: string]: IGunSubscription } = {};
  private _cachedHandler: { [peer: string]: boolean } = {};
  private _timeoutTimer?: any;
  private _timeout: boolean = false;
  private _promise?: Promise<any>;
  private _promiseResolve?: (data: any) => void;
  private _cachedResponses: { [peer: string]: DnsResponse | null } = {};
  private _cacheChecked = false;
  private _cachedTimers: { [peer: string]: NodeJS.Timer } = {};
  private _requestSent: boolean = false;
  private _completed: boolean = false;

  constructor(network: DnsNetwork, query: DnsRequest) {
    this._network = network;
    this._query = query;
    this.init();
  }

  get promise(): Promise<any> {
    return this._promise as Promise<any>;
  }

  private async init() {
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(this._query.data))
      .digest("hex");

    if (this._query.force) {
      this._query.force = true;
    }

    this._requestId =
      this._requestId ?? `${this._query.query};${this._query.chain};${hash}`;
    this._promise =
      this._promise ??
      new Promise<any>((resolve) => {
        this._promiseResolve = resolve;
      });

    if (this._query.force) {
      this._cacheChecked = true;
    }

    this.addPeer = this.addPeer.bind(this);
    this._network.on("newActivePeer", this.addPeer);

    await this._network.waitForPeers();

    await Promise.allSettled(
      Object.keys(this._network.activePeers).map((peer) => this.addPeer(peer))
    );
    this._timeoutTimer =
      this._timeoutTimer ??
      setTimeout(
        this.handeTimeout.bind(this),
        this._network.queryTimeout * 1000
      );
  }

  private getCachedRecordHandler(
    pubkey: string
  ): (response: DnsResponse) => void {
    return (response?: DnsResponse) => {
      if (pubkey in this._cachedResponses) {
        return;
      }
      if (response) {
        if (!this.hasResponseExpired(response)) {
          this._cachedResponses[pubkey] = this.isInvalidResponse(response)
            ? { data: null, updated: 0, requests: 0 }
            : response;
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

  private getResponseHandler(pubkey: string): (value: DnsResponse) => void {
    return (value: DnsResponse) => {
      if (pubkey in this._responses) {
        return;
      }

      if (!value) {
        return;
      }

      if (
        this._query.force &&
        Date.now() - value.updated > this._network.forceTimeout * 1000
      ) {
        return;
      }

      this._responses[pubkey] = this.hasResponseExpired(value)
        ? null
        : this.isInvalidResponse(value)
        ? { data: null, updated: 0, requests: 0 }
        : value;

      this.pruneDeadPeers();
      this.checkResponses();
    };
  }

  private pruneDeadPeers() {
    for (const peer in this._responses) {
      if (!(peer in this._network.activePeers)) {
        delete this._responses[peer];
      }
    }
  }

  private checkResponses(cached: boolean = false): boolean {
    const responses: { [response: string]: number } = {};
    const responseStore = cached ? this._cachedResponses : this._responses;

    if (
      Object.keys(responseStore).length !==
      Object.keys(this._network.activePeers).length
    ) {
      return false;
    }

    const responseStoreKeys = Object.keys(responseStore);

    // tslint:disable-next-line:forin
    for (const peer in responseStore) {
      const responseIndex = responseStoreKeys.indexOf(peer);

      responses[responseIndex] = responses[responseIndex] ?? 0;
      responses[responseIndex]++;
    }
    for (const responseIndex in responses) {
      if (responses[responseIndex] >= this._network.majorityThreshold) {
        const response: DnsResponse | null =
          responseStore[responseStoreKeys[parseInt(responseIndex, 10)]];

        // @ts-ignore
        if (null === response || null === response?.data) {
          if (!cached) {
            this.retry();
          }
          return false;
        }

        let data;

        try {
          data = JSON.parse(response?.data as string);
        } catch (e) {
          data = response?.data;
        }

        this.resolve(data);
        return true;
      }
    }

    return false;
  }

  private handeTimeout() {
    this.resolve(false, true);
  }

  private resolve(data: any, timeout: boolean = false): void {
    this.cleanHandlers();

    clearTimeout(this._timeoutTimer);
    this._timeout = timeout;
    this._completed = true;
    // @ts-ignore
    this._promiseResolve(data);
  }

  private cleanHandlers() {
    Object.keys(this._handlers).forEach(
      // @ts-ignore
      // tslint:disable-next-line:ban-types
      (pubkey: string) => {
        this._handlers[pubkey].off();
        delete this._handlers[pubkey];
      }
    );
    Object.values(this._cachedTimers).forEach((timer) => clearInterval(timer));
    this._cachedTimers = {};
    this._network.off("newActivePeer", this.addPeer as (pubkey: string) => any);
    this._cachedHandler = {};
  }

  private fetch() {
    Object.keys(this._network.activePeers).forEach((peer) =>
      this.fetchPeer(peer)
    );

    const query = { ...this._query };
    query.data = JSON.stringify(query.data);

    this.sendRequest(query);
  }

  private hasResponseExpired(response: DnsResponse): boolean {
    return Date.now() - response.updated > this._network.maxTtl * 1000;
  }

  private retry() {
    this._cachedResponses = {};
    this._responses = {};
    this._cacheChecked = false;
    this._requestSent = false;
    this.cleanHandlers();

    if (this._completed) {
      return;
    }

    this.init();
  }

  private sendRequest(query: DnsRequest, id = uuidv4(), count = 0) {
    if (this._timeout || this._requestSent) {
      return;
    }

    if (count > 3) {
      id = uuidv4();
      count = 0;
    } else {
      count++;
    }

    const timer = setTimeout(() => {
      this.sendRequest(query, id, count);
    }, 100);

    this._network.network
      .get("requests")
      .get(id)
      .put(query, (ack: object) => {
        clearTimeout(timer);
        // @ts-ignore
        if (ack.err) {
          this.sendRequest(query, id, count);
        } else {
          this._requestSent = true;
        }
      });

    this._network.network.get("requests").get(id, (data: object) => {
      clearTimeout(timer);
      // @ts-ignore
      if (!data.put) {
        this.sendRequest(query, id, count);
      } else {
        this._requestSent = true;
      }
    });
  }

  private fetchPeer(pubkey: string) {
    if (pubkey in this._handlers) {
      return;
    }

    if (!(pubkey in this._handlers)) {
      const ref = this._network.network
        .user(pubkey)
        .get("responses")
        .get(this._requestId);
      this._handlers[pubkey] = subscribe(ref, this.getResponseHandler(pubkey));
    }
  }

  private async addPeer(pubkey: string) {
    await this._network.authed;

    if (this._cacheChecked || this._query.force) {
      this.fetch();
      return;
    }

    if (pubkey in this._cachedHandler) {
      return;
    }

    this._cachedHandler[pubkey] = true;
    this._cachedTimers[pubkey] = setInterval(() => {
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
  }

  private isInvalidResponse(response: DnsResponse): boolean {
    if (typeof response.data === "object" && !Array.isArray(response.data)) {
      const data = { ...response.data };

      // @ts-ignore
      if (data["#"]) {
        // @ts-ignore
        delete data["#"];
      }
      if (0 === Object.keys(data).length) {
        return true;
      }
    }

    return false;
  }
}
