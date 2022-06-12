import SubResolverBase from "../subresolverbase.js";
// @ts-ignore
import AVVY from "@avvy/client";
import GunProvider from "./eip137/gunprovider.js";
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
    const connection = new GunProvider(
      pocketNetworks["avax-mainnet"],
      this.resolver.dnsNetwork,
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
