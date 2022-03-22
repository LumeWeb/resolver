import {
  isDomain,
  isIp,
  normalizeDomain,
  registryEntryRegExp,
  startsWithSkylinkRegExp,
} from "../lib/util.js";
import { SkynetClient } from "@lumeweb/skynet-js";
import SubResolverBase from "../SubResolverBase.js";
// @ts-ignore
import tldEnum from "@lumeweb/tld-enum";
export default class Handshake extends SubResolverBase {
  async resolve(input, params = {}) {
    let tld = input;
    if (isIp(input)) {
      return false;
    }
    if (input.endsWith(".eth")) {
      return false;
    }
    if ("subquery" in params) {
      return false;
    }
    if (input.includes(".")) {
      tld = input.split(".")[input.split(".").length - 1];
    }
    const records = await this.query(tld);
    if (!records) {
      return false;
    }
    let result = false;
    for (const record of records.reverse()) {
      // @ts-ignore
      switch (record.type) {
        case "NS": {
          result = await this.processNs(input, record, records);
          break;
        }
        case "TXT": {
          result = await this.processTxt(record);
          break;
        }
        case "SYNTH6": {
          // @ts-ignore
          if ("ipv6" in params && params.ipv6) {
            // @ts-ignore
            result = record.address;
          }
          break;
        }
        case "SYNTH4": {
          // @ts-ignore
          result = record.address;
          break;
        }
        // @ts-ignore
        default: {
          // @ts-ignore
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
  async processNs(domain, record, records) {
    // @ts-ignore
    const glue = records.slice().find(
      (item) =>
        // @ts-ignore
        ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns
    );
    if (glue) {
      return this.resolver.resolve(domain, {
        subquery: true,
        nameserver: glue.address,
      });
    }
    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;
    if (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) {
      if (foundDomain.includes(".")) {
        const tld = foundDomain.split(".")[foundDomain.split(".").length - 1];
        isIcann = tldEnum.list.includes(tld);
      }
      if (!isIcann) {
        const hnsNs = await this.resolver.resolve(foundDomain);
        if (hnsNs) {
          return this.resolver.resolve(domain, {
            subquery: true,
            nameserver: hnsNs,
          });
        }
      }
      return this.resolver.resolve(domain, {
        subquery: true,
        nameserver: foundDomain,
      });
    }
    const result = await this.resolver.resolve(record.ns, { domain });
    return result || record.ns;
  }
  async query(tld) {
    const query = this.resolver.dnsNetwork.query("getnameresource", "hns", [
      tld,
    ]);
    const resp = await query.promise;
    // @ts-ignore
    return resp?.records || [];
  }
  async processTxt(record) {
    // @ts-ignore
    let matches = record.txt.slice().pop().match(startsWithSkylinkRegExp);
    // @ts-ignore
    if (matches) {
      return decodeURIComponent(matches[2]);
    }
    // @ts-ignore
    matches = record.txt.slice().pop().match(registryEntryRegExp);
    // @ts-ignore
    if (matches) {
      const client = new SkynetClient(
        `https://${this.resolver.getRandomPortal("registry")?.host}`
      );
      const pubKey = decodeURIComponent(matches.groups.publickey).replace(
        "ed25519:",
        ""
      );
      const entry = await client.registry.getEntry(
        pubKey,
        matches.groups.datakey,
        // @ts-ignore
        { hashedDataKeyHex: true }
      );
      return Buffer.from(entry.entry?.data).toString();
    }
    return false;
  }
}
