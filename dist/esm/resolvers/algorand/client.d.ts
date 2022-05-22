import algosdk from "algosdk";
import DnsNetwork from "../../DnsNetwork.js";
import { Query } from "algosdk/dist/cjs/src/client/baseHTTPClient.js";
export declare function getAcceptFormat(
  query?: Query<"msgpack" | "json">
): "application/msgpack" | "application/json";
export default class Client extends algosdk.Algodv2 {
  private _force;
  private _network;
  private c;
  constructor(network: DnsNetwork, force?: boolean);
  private post;
}
//# sourceMappingURL=client.d.ts.map
