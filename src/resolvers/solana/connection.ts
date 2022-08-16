import { Connection as SolanaConnection } from "@solana/web3.js";
import pocketNetworks from "../../data/pocketNetworks.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";

export default class Connection extends SolanaConnection {
  private _network: RpcNetwork;
  // @ts-ignore
  private _force: boolean;

  constructor(network: RpcNetwork, force = false) {
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
      pocketNetworks["solana-mainnet"],
      args,
      this._force
    );

    return req.result;
  }
}
