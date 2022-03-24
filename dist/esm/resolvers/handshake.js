import {
  isDomain,
  isIp,
  normalizeDomain,
  registryEntryRegExp,
  startsWithSkylinkRegExp,
} from "../lib/util.js";
// @ts-ignore
import { SkynetClient } from "@lumeweb/skynet-js";
import SubResolverBase from "../SubResolverBase.js";
// @ts-ignore
import tldEnum from "@lumeweb/tld-enum";
/*
 Copied from https://github.com/SkynetLabs/skynet-kernel/blob/4d44170fa4445004da9d9485148c5553ea668e57/extension/lib/encoding.ts
 */
const b64ToBuf = (b64) => {
  // Check that the final string is valid base64.
  const b64regex = /^[0-9a-zA-Z-_/+=]*$/;
  if (!b64regex.test(b64)) {
    // @ts-ignore
    return [null, null];
  }
  // Swap any '-' characters for '+', and swap any '_' characters for '/'
  // for use in the atob function.
  b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
  // Perform the conversion.
  const binStr = atob(b64);
  const len = binStr.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = binStr.charCodeAt(i);
  }
  // @ts-ignore
  return [buf, null];
};
/*
 Copied from https://github.com/SkynetLabs/skynet-kernel/blob/4d44170fa4445004da9d9485148c5553ea668e57/extension/lib/download.ts
 */
const parseSkylinkBitfield = (skylink) => {
  // Validate the input.
  if (skylink.length !== 34) {
    return [0, 0, 0, new Error("provided skylink has incorrect length")];
  }
  // Extract the bitfield.
  let bitfield = new DataView(skylink.buffer).getUint16(0, true);
  // Extract the version.
  // tslint:disable-next-line:no-bitwise
  const version = (bitfield & 3) + 1;
  // Only versions 1 and 2 are recognized.
  if (version !== 1 && version !== 2) {
    return [0, 0, 0, new Error("provided skylink has unrecognized version")];
  }
  // Verify that the mode is valid, then fetch the mode.
  // tslint:disable-next-line:no-bitwise
  bitfield = bitfield >> 2;
  // tslint:disable-next-line:no-bitwise
  if ((bitfield & 255) === 255) {
    return [0, 0, 0, new Error("provided skylink has an unrecognized version")];
  }
  let mode = 0;
  for (let i = 0; i < 8; i++) {
    // tslint:disable-next-line:no-bitwise
    if ((bitfield & 1) === 0) {
      // tslint:disable-next-line:no-bitwise
      bitfield = bitfield >> 1;
      // tslint:disable-next-line:no-bitwise
      break;
    }
    // tslint:disable-next-line:no-bitwise
    bitfield = bitfield >> 1;
    mode++;
  }
  // If the mode is greater than 7, this is not a valid v1 skylink.
  if (mode > 7) {
    return [0, 0, 0, new Error("provided skylink has an invalid v1 bitfield")];
  }
  // Determine the offset and fetchSize increment.
  // tslint:disable-next-line:no-bitwise
  const offsetIncrement = 4096 << mode;
  let fetchSizeIncrement = 4096;
  if (mode > 0) {
    // tslint:disable-next-line:no-bitwise
    fetchSizeIncrement = fetchSizeIncrement << (mode - 1);
  }
  // The next three bits decide the fetchSize.
  // tslint:disable-next-line:no-bitwise
  let fetchSizeBits = bitfield & 7;
  fetchSizeBits++; // semantic upstep, range should be [1,8] not [0,8).
  const fetchSize = fetchSizeBits * fetchSizeIncrement;
  // tslint:disable-next-line:no-bitwise
  bitfield = bitfield >> 3;
  // The remaining bits determine the offset.
  const offset = bitfield * offsetIncrement;
  // tslint:disable-next-line:no-bitwise
  if (offset + fetchSize > 1 << 22) {
    return [0, 0, 0, new Error("provided skylink has an invalid v1 bitfield")];
  }
  // Return what we learned.
  // @ts-ignore
  return [version, offset, fetchSize, null];
};
export default class Handshake extends SubResolverBase {
  async resolve(input, params = {}, force = false) {
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
    const records = await this.query(tld, force);
    if (!records) {
      return false;
    }
    let result = false;
    for (const record of records.reverse()) {
      switch (record.type) {
        case "NS": {
          result = await this.processNs(input, record, records, force);
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
  async processNs(domain, record, records, force) {
    // @ts-ignore
    const glue = records.slice().find(
      (item) =>
        // @ts-ignore
        ["GLUE4", "GLUE6"].includes(item.type) && item.ns === record.ns
    );
    if (glue) {
      return this.resolver.resolve(
        domain,
        {
          subquery: true,
          nameserver: glue.address,
        },
        force
      );
    }
    const foundDomain = normalizeDomain(record.ns);
    let isIcann = false;
    if (isDomain(foundDomain) || /[a-zA-Z0-9\-]+/.test(foundDomain)) {
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
  async query(tld, force) {
    const query = this.resolver.dnsNetwork.query(
      "getnameresource",
      "hns",
      [tld],
      force
    );
    const resp = await query.promise;
    // @ts-ignore
    return resp?.records || [];
  }
  async processTxt(record) {
    // @ts-ignore
    let matches = record.txt.slice().pop().match(startsWithSkylinkRegExp);
    // @ts-ignore
    if (matches) {
      const [u8Link, err64] = b64ToBuf(matches[2]);
      if (err64 !== null) {
        return false;
      }
      if (u8Link.length !== 34) {
        return false;
      }
      const [version, offset, fetchSize, errBF] = parseSkylinkBitfield(u8Link);
      if (errBF !== null) {
        return false;
      }
      return decodeURIComponent(matches[2]);
    }
    // @ts-ignore
    matches = record.txt.slice().pop().match(registryEntryRegExp);
    // @ts-ignore
    if (matches) {
      const portal = this.resolver.getRandomPortal("registry");
      if (!portal) {
        return false;
      }
      const client = new SkynetClient(`https://${portal.host}`);
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
