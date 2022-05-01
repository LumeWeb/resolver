import SubResolverBase from "../SubResolverBase.js";
import Client from "./algorand/client.js";
import Indexer from "./algorand/indexer.js";
import { ansResolver } from "anssdk/src/index.js";
import { normalizeSkylink } from "../lib/util.js";

interface DnsRecord {
  key: string;
  value: string;
}

type DomainData = {
  found: boolean;
  address: string;
  kvPairs: DnsRecord[];
};

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

    const resolver = new ansResolver(client, indexer);
    const nameData: DomainData = (await resolver.resolveName(
      input
    )) as DomainData;

    if (!nameData.found) {
      return false;
    }

    let record = findInRecords(nameData.kvPairs, "content");

    const skylink = await normalizeSkylink(record as string, this.resolver);

    if (skylink) {
      return skylink;
    }

    if (!record) {
      record = findInRecords(nameData.kvPairs, "ip");
    }

    if (!record) {
      record = findInRecords(nameData.kvPairs, "cname");
    }

    return record;
  }
}

function findInRecords(records: DnsRecord[], key: string): string | boolean {
  for (const record of records) {
    if (record.key === key) {
      return record.value;
    }
  }

  return false;
}
