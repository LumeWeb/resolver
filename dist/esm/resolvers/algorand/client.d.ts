import algosdk from "algosdk";
import { Query } from "algosdk/dist/cjs/src/client/baseHTTPClient.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export declare function getAcceptFormat(
  query?: Query<"msgpack" | "json">
): "application/msgpack" | "application/json";
export default class Client extends algosdk.Algodv2 {
  private _force;
  private _network;
  private c;
  constructor(network: RpcNetwork, force?: boolean);
  private post;
}
//# sourceMappingURL=client.d.ts.map
