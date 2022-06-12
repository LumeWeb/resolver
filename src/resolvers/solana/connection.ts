import { Connection as SolanaConnection } from "@solana/web3.js";
import DnsNetwork from "../../dnsnetwork.js";
import pocketNetworks from "../../data/pocketNetworks.js";

export default class Connection extends SolanaConnection {
  private _network: DnsNetwork;
  // @ts-ignore
  private _force: boolean;

  constructor(network: DnsNetwork, force = false) {
    super("http://0.0.0.0");
    this._force = force;
    // @ts-ignore
    this._network = network;
    // @ts-ignore
    this._rpcWebSocket.removeAllListeners();
    // @ts-ignore
    this._rpcRequest = this.__rpcRequest;
  }

  async __rpcRequest(methodName: string, args: any[]) {
    const req = this._network.query(
      methodName,
      pocketNetworks["sol-mainnet"],
      args,
      this._force
    );

    return req.promise;
  }
}
