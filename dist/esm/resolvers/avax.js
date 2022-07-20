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
    const content = await domain.resolve(AVVY.RECORDS.CONTENT);
    const skylink = await normalizeSkylink(content, this.resolver);
    if (skylink) {
      return skylink;
    }
    if (content) {
      return content;
    }
    let record = await domain.resolve(AVVY.RECORDS.DNS_CNAME);
    if (!record) {
      record = await domain.resolve(AVVY.RECORDS.DNS_A);
    }
    return record;
  }
}
