import algosdk from "algosdk";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export default class Indexer extends algosdk.Indexer {
  private _force;
  private _network;
  private c;
  constructor(network: RpcNetwork, force?: boolean);
  private get;
}
//# sourceMappingURL=indexer.d.ts.map
