import SubResolverBase from "../subResolverBase.js";
// @ts-ignore
import AVVY from "@avvy/client";
import RpcProvider from "./eip137/rpcProvider.js";
import pocketNetworks from "../data/pocketNetworks.js";
import { normalizeSkylink } from "../lib/util.js";
export default class Avax extends SubResolverBase {
  getSupportedTlds() {
    return ["avax"];
  }
  async resolve(input, params, force) {
    if (!this.isTldSupported(input)) {
      return false;
    }
    const connection = new RpcProvider(
      pocketNetworks["avax-mainnet"],
      this.resolver.rpcNetwork,
      force
    );
    const domain = new AVVY(connection).name(input);
    let content = false;
    let skylink = false;
    try {
      content = await domain.resolve(AVVY.RECORDS.CONTENT);
      // tslint:disable-next-line:no-empty
    } catch (e) {}
    if (content) {
      skylink = await normalizeSkylink(content, this.resolver);
    }
    if (skylink) {
      return skylink;
    }
    if (content) {
      return content;
    }
    let record = false;
    try {
      record = await domain.resolve(AVVY.RECORDS.DNS_CNAME);
      // tslint:disable-next-line:no-empty
    } catch (e) {}
    if (!record) {
      try {
        record = await domain.resolve(AVVY.RECORDS.DNS_A);
        // tslint:disable-next-line:no-empty
      } catch (e) {}
    }
    return record;
  }
}
