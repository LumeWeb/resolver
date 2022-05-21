import SubResolverBase from "../SubResolverBase.js";
import Client from "./algorand/client.js";
import Indexer from "./algorand/indexer.js";
import { ANS, NameNotRegisteredError } from "@algonameservice/sdk";
import { normalizeSkylink } from "../lib/util.js";

export default class Algorand extends SubResolverBase {
  getSupportedTlds(): string[] {
    return ["algo"];
  }

  async resolve(
    input: string,
    params: { [p: string]: any },
    force: boolean
  ): Promise<string | boolean> {
    if (!this.isTldSupported(input)) {
      return false;
    }

    const client = new Client(this.resolver.dnsNetwork, force);
    const indexer = new Indexer(this.resolver.dnsNetwork, force);

    // @ts-ignore
    const resolver = new ANS(client, indexer);
    const domain = resolver.name(input);

    let record: string | boolean | Error;

    try {
      record = await domain.getContent();
    } catch (e: any) {
      record = false;
    }

    const skylink = await normalizeSkylink(record as string, this.resolver);

    if (skylink) {
      return skylink;
    }

    if (!record) {
      try {
        record = await domain.getText("ipaddress");
      } catch (e: any) {
        record = false;
      }
    }

    return record as string;
  }
}
