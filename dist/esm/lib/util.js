import { SkynetClient } from "@lumeweb/skynet-js";
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
export function isIp(ip) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
}
export function isDomain(domain) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
    domain
  );
}
export const startsWithSkylinkRegExp = /^(sia:\/\/)?([a-zA-Z0-9_-]{46})/;
export const registryEntryRegExp =
  /^skyns:\/\/(?<publickey>[a-zA-Z0-9%]+)\/(?<datakey>[a-zA-Z0-9%]+)$/;
export function normalizeDomain(domain) {
  return domain.replace(/^\.+|\.+$/g, "").replace(/^\/+|\/+$/g, "");
}
export async function normalizeSkylink(skylink, resolver) {
  skylink = skylink.toString();
  // @ts-ignore
  let matches = skylink.match(startsWithSkylinkRegExp);
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
  matches = skylink.match(registryEntryRegExp);
  // @ts-ignore
  if (matches) {
    const portal = resolver.getRandomPortal("registry");
    if (!portal) {
      return false;
    }
    const client = new SkynetClient(`https://${portal.host}`);
    // @ts-ignore
    const pubKey = decodeURIComponent(matches.groups.publickey).replace(
      "ed25519:",
      ""
    );
    const entry = await client.registry.getEntry(
      pubKey,
      // @ts-ignore
      matches.groups.datakey,
      // @ts-ignore
      { hashedDataKeyHex: true }
    );
    return Buffer.from(entry.entry?.data).toString();
  }
  return false;
}
export function getTld(domain) {
  if (domain.includes(".")) {
    domain = domain.split(".")[domain.split(".").length - 1];
  }
  return domain;
}
export function getSld(domain) {
  if (domain.includes(".")) {
    domain = domain
      .split(".")
      .slice(0, domain.split(".").length - 1)
      .join(".");
  }
  return domain;
}
