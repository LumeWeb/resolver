import algosdk from "algosdk";
// @ts-ignore
import { Query } from "algosdk/dist/cjs/src/client/baseHTTPClient.js";
// @ts-ignore
import * as utils from "algosdk/dist/cjs/src/utils/utils.js";
import { getAcceptFormat } from "./client.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
// @ts-ignore
// import * as HTTPClientImport from "algosdk/dist/cjs/src/client/client.js";
// const { default: HTTPClient } = HTTPClientImport.default;

interface HTTPClientResponse {
  body: Uint8Array | any;
  text?: string;
  headers: Record<string, string>;
  status: number;
  ok: boolean;
}

function removeFalsyOrEmpty(obj: any) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // eslint-disable-next-line no-param-reassign
      if (!obj[key] || obj[key].length === 0) delete obj[key];
    }
  }
  return obj;
}

// @ts-ignore
export default class Indexer extends algosdk.Indexer {
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

  private async get(
    relativePath: string,
    query?: Query<any>,
    requestHeaders?: Record<string, string>,
    jsonOptions?: utils.JSONOptions
  ): Promise<HTTPClientResponse> {
    const format = getAcceptFormat(query);
    const fullHeaders = { ...requestHeaders, accept: format };
    const req = this._network.query(
      "algorand_rest_indexer_request",
      "algorand-mainnet-indexer",
      {
        method: "GET",
        endpoint: relativePath,
        query: removeFalsyOrEmpty(query),
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
