import algosdk from "algosdk";
import DnsNetwork from "../../DnsNetwork.js";
import pocketNetworks from "../../data/pocketNetworks.js";
// @ts-ignore
import { Query } from "algosdk/dist/cjs/src/client/baseHTTPClient.js";
// @ts-ignore
import * as HTTPClientImport from "algosdk/dist/cjs/src/client/client.js";
const { default: HTTPClient } = HTTPClientImport.default;

interface HTTPClientResponse {
  body: Uint8Array | any;
  text?: string;
  headers: Record<string, string>;
  status: number;
  ok: boolean;
}

export function getAcceptFormat(
  query?: Query<"msgpack" | "json">
): "application/msgpack" | "application/json" {
  if (
    query !== undefined &&
    Object.prototype.hasOwnProperty.call(query, "format")
  ) {
    switch (query.format) {
      case "msgpack":
        return "application/msgpack";
      case "json":
      default:
        return "application/json";
    }
  } else return "application/json";
}

export default class Client extends algosdk.Algodv2 {
  private _force: boolean;
  private _network: DnsNetwork;
  // @ts-ignore
  private c: Client;
  constructor(network: DnsNetwork, force = false) {
    super("http://0.0.0.0");
    this._network = network;
    this._force = force;
    this.c = this;
  }

  private async post(
    relativePath: string,
    data: any,
    requestHeaders?: Record<string, string>
  ): Promise<HTTPClientResponse> {
    const format = getAcceptFormat();
    const req = this._network.query(
      "algorand_rest_request",
      pocketNetworks["algorand-mainnet"],
      {
        method: "POST",
        endpoint: relativePath,
        data,
      }
    );

    const resp = await req.promise;

    // @ts-ignore
    return HTTPClient.prepareResponse(resp, format);
  }
}
