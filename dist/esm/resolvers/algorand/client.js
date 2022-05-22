import algosdk from "algosdk";
import pocketNetworks from "../../data/pocketNetworks.js";
// @ts-ignore
import * as HTTPClientImport from "algosdk/dist/cjs/src/client/client.js";
const { default: HTTPClient } = HTTPClientImport.default;
export function getAcceptFormat(query) {
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
function tolowerCaseKeys(o) {
  /* eslint-disable no-param-reassign,no-return-assign,no-sequences */
  // @ts-ignore
  // tslint:disable-next-line:ban-comma-operator
  return Object.keys(o).reduce((c, k) => ((c[k.toLowerCase()] = o[k]), c), {});
  /* eslint-enable no-param-reassign,no-return-assign,no-sequences */
}
export default class Client extends algosdk.Algodv2 {
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
  async post(relativePath, data, requestHeaders) {
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
    const res = await req.promise;
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
