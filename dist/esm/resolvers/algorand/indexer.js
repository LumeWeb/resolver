import algosdk from "algosdk";
import { getAcceptFormat } from "./client.js";
function removeFalsyOrEmpty(obj) {
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
  _force;
  _network;
  // @ts-ignore
  c;
  constructor(network, force = false) {
    super("http://0.0.0.0");
    this._network = network;
    this._force = force;
    this.c = this;
  }
  async get(relativePath, query, requestHeaders, jsonOptions) {
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
    const body = await req.result;
    const text = undefined;
    // @ts-ignore
    return {
      body,
      text,
      ok: true,
    };
  }
}
