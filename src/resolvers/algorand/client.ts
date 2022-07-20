import algosdk from "algosdk";
import pocketNetworks from "../../data/pocketNetworks.js";
// @ts-ignore
import { Query } from "algosdk/dist/cjs/src/client/baseHTTPClient.js";
// @ts-ignore
import * as HTTPClientImport from "algosdk/dist/cjs/src/client/client.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";

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
  } else {
    return "application/json";
  }
}

function tolowerCaseKeys(o: any) {
  /* eslint-disable no-param-reassign,no-return-assign,no-sequences */
  // @ts-ignore
  // tslint:disable-next-line:ban-comma-operator
  return Object.keys(o).reduce((c, k) => ((c[k.toLowerCase()] = o[k]), c), {});
  /* eslint-enable no-param-reassign,no-return-assign,no-sequences */
}

export default class Client extends algosdk.Algodv2 {
  private _force: boolean;
  private _network: RpcNetwork;
  // @ts-ignore
  private c: Client;

  constructor(network: RpcNetwork, force = false) {
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
    const fullHeaders = {
      "content-type": "application/json",
      ...tolowerCaseKeys(requestHeaders),
    };
    const req = this._network.query(
      "algorand_rest_request",
      pocketNetworks["algorand-mainnet"],
      {
        method: "POST",
        endpoint: relativePath,
        data: HTTPClient.serializeData(data, requestHeaders),
        fullHeaders,
      },
      this._force
    );

    const res = await req.result;
    const { body } = res;
    const text = undefined;

    // @ts-ignore
    return {
      ...res,
      body,
      text,
      ok: Math.trunc(res.status / 100) === 2,
    };
  }
}
