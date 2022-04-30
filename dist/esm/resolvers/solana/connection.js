import { Connection as SolanaConnection } from "@solana/web3.js";
import pocketNetworks from "../../data/pocketNetworks.js";
export default class Connection extends SolanaConnection {
  network;
  // @ts-ignore
  constructor(network) {
    super("http://0.0.0.0");
    // @ts-ignore
    this.network = network;
    // @ts-ignore
    this._rpcWebSocket.removeAllListeners();
    // @ts-ignore
    this._rpcRequest = this.__rpcRequest;
  }
  async __rpcRequest(methodName, args) {
    const req = this.network.query(
      methodName,
      pocketNetworks["sol-mainnet"],
      args
    );
    return req.promise;
  }
}
