import {
  getTld,
  isDomain,
  isIp,
  normalizeDomain,
  normalizeSkylink,
} from "../lib/util.js";

// @ts-ignore
import { SkynetClient } from "@lumeweb/skynet-js";
import SubResolverBase from "../SubResolverBase.js";
// @ts-ignore
import tldEnum from "@lumeweb/tld-enum";
import DnsQuery from "../DnsQuery.js";
import Resolver from "../Resolver.js";

import * as ethers from "ethers";

export default class Handshake extends SubResolverBase {
  private tldBlacklist: string[] = [];
  constructor(resolver: Resolver) {
    super(resolver);

    for (const subresolver of resolver.resolvers) {
      this.tldBlacklist = [
        ...this.tldBlacklist,
        ...subresolver.getSupportedTlds(),
      ];
    }
  }

  async resolve(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    const tld = getTld(input);

    if (this.tldBlacklist.includes(tld)) {
      return false;
    }

    if (isIp(input)) {
      return false;
    }

    if ("subquery" in params) {
      return false;
    }

    const records = await this.query(tld, force);
    if (!records) {
      return false;
    }
    let result: string | boolean = false;

    for (const record of (records as { [key: string]: any }[]).reverse()) {
      switch (record.type) {
        case "NS": {
          result = await this.processNs(input, record, records, force);
          break;
        }
        case "GLUE4": {
          result = await this.processGlue(input, record, force);
          break;
        }
        case "TXT": {
          result = await this.processTxt(record);
          break;
        }
        case "SYNTH6": {
          if ("ipv6" in params && params.ipv6) {
            result = record.address;
          }
          break;
        }
        case "SYNTH4": {
          result = record.address;
          break;
        }
        default: {
          break;
        }
      }

      if (result) {
        break;
      }
    }

    return result;
  }

  // @ts-ignore
  private async processNs(domain: string, record, records, force: boolean) {
    // @ts-ignore
    const glue = records.slice().find(
      (item: object) =>
        // @ts-ignore
        ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns
    );

    if (glue) {
      return this.processGlue(domain, record, force);
    }

    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;

    let isEvmAddress = false;

    if (
      foundDomain.split(".").length >= 2 &&
      ethers.utils.isAddress(foundDomain.split(".")[0])
    ) {
      isEvmAddress = true;
    }

    if (
      (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) &&
      !isEvmAddress
    ) {
      if (foundDomain.includes(".")) {
        const tld = foundDomain.split(".")[foundDomain.split(".").length - 1];

        isIcann = tldEnum.list.includes(tld);
      }

      if (!isIcann) {
        const hnsNs = await this.resolver.resolve(foundDomain, { force });

        if (hnsNs) {
          return this.resolver.resolve(domain, {
            subquery: true,
            nameserver: hnsNs,
            force,
          });
        }
      }

      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: foundDomain,
        },
        force
      );
    }

    const result = await this.resolver.resolve(record.ns, { domain }, force);

    return result || record.ns;
  }

  private async processGlue(domain: string, record: any, force: boolean) {
    if (isDomain(record.ns) && isIp(record.address)) {
      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: record.address,
        },
        force
      );
    }

    return false;
  }

  private async query(tld: string, force: boolean): Promise<object | boolean> {
    const query: DnsQuery = this.resolver.dnsNetwork.query(
      "getnameresource",
      "hns",
      [tld],
      force
    );
    const resp = await query.promise;

    // @ts-ignore
    return resp?.records || [];
  }

  private async processTxt(record: any): Promise<string | boolean> {
    const content = record.txt.slice().pop();

    const skylink = await normalizeSkylink(content, this.resolver);

    if (skylink) {
      return skylink;
    }

    return content;
  }
}
