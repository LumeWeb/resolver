import SubResolverBase from "../SubResolverBase.js";
import Client from "./algorand/client.js";
import Indexer from "./algorand/indexer.js";
import ANS from "@algonameservice/sdk";
import { normalizeSkylink } from "../lib/util.js";
export default class Algorand extends SubResolverBase {
  getSupportedTlds() {
    return ["algo"];
  }
  async resolve(input, params, force) {
    if (!this.isTldSupported(input)) {
      return false;
    }
    const client = new Client(this.resolver.dnsNetwork, force);
    const indexer = new Indexer(this.resolver.dnsNetwork, force);
    // @ts-ignore
    const resolver = new ANS(client, indexer);
    const domain = resolver.name(input);
    let record;
    try {
      record = await domain.getContent();
    } catch (e) {
      record = false;
    }
    const skylink = await normalizeSkylink(record, this.resolver);
    if (skylink) {
      return skylink;
    }
    if (!record) {
      try {
        record = await domain.getText("ipaddress");
      } catch (e) {
        record = false;
      }
    }
    return record;
  }
}
