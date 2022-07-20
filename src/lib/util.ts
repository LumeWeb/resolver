import Resolver from "../resolver.js";
import {
  addContextToErr,
  defaultPortalList,
  Err,
  validSkylink,
} from "libskynet";
import {
  bufToB64,
  bufToHex,
  hexToBuf,
  verifyRegistryReadResponse,
} from "libskynet/dist";

export function isIp(ip: string) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
    ip
  );
}

export function isDomain(domain: string) {
  return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(
    domain
  );
}

export const startsWithSkylinkRegExp = /^(sia:\/\/)?([a-zA-Z0-9_-]{46})/;
export const registryEntryRegExp =
  /^skyns:\/\/(?<publickey>[a-zA-Z0-9%]+)\/(?<datakey>[a-zA-Z0-9%]+)$/;

export function normalizeDomain(domain: string): string {
  return domain.replace(/^\.+|\.+$/g, "").replace(/^\/+|\/+$/g, "");
}

export async function normalizeSkylink(
  skylink: string,
  resolver: Resolver
): Promise<string | boolean> {
  skylink = skylink.toString();
  // @ts-ignore
  let matches = skylink.match(startsWithSkylinkRegExp);
  // @ts-ignore
  if (matches) {
    if (validSkylink(matches[2])) {
      return decodeURIComponent(matches[2]);
    }
  }

  // @ts-ignore
  matches = skylink.match(registryEntryRegExp);

  // @ts-ignore
  if (matches) {
    // @ts-ignore
    const pubKey = decodeURIComponent(matches.groups.publickey).replace(
      "ed25519:",
      ""
    );

    bufToB64(
      await getRegistryEntry(
        hexToBuf(pubKey)[0],
        // @ts-ignore
        hexToBuf(matches.groups.datakey)[0]
      )
    );
  }

  return false;
}

export function getTld(domain: string): string {
  if (domain.includes(".")) {
    domain = domain.split(".")[domain.split(".").length - 1];
  }

  return domain;
}

export function getSld(domain: string): string {
  if (domain.includes(".")) {
    domain = domain
      .split(".")
      .slice(0, domain.split(".").length - 1)
      .join(".");
  }

  return domain;
}

async function getRegistryEntry(
  pubkey: Uint8Array,
  datakey: Uint8Array
): Promise<Uint8Array> {
  if (typeof process === "undefined") {
    if (window?.document) {
      // @ts-ignore
      return (await import("libkernel"))
        .registryRead(pubkey, datakey)
        .then((result: [registryReadResult, Err]) => result[0].entryData);
    }
    // @ts-ignore
    return (await import("libkmodule"))
      .registryRead(pubkey, datakey)
      .then((result: [registryReadResult, Err]) => result[0].entryData);
  }
  const libskynetnode = await import("libskynetnode");

  return new Promise((resolve, reject) => {
    const pubkeyHex = bufToHex(pubkey);
    const datakeyHex = bufToHex(datakey);
    const endpoint =
      "/skynet/registry?publickey=ed25519%3A" +
      pubkeyHex +
      "&datakey=" +
      datakeyHex;
    const verifyFunc = (response: Response): Promise<Err> =>
      verifyRegistryReadResponse(response, pubkey, datakey);
    libskynetnode
      // @ts-ignore
      .progressiveFetch(endpoint, {}, defaultPortalList, verifyFunc)
      .then((result: any) => {
        // Check for a success.
        if (result.success === true) {
          result.response
            .json()
            .then((j: any) => {
              resolve(j.data);
            })
            .catch((err: any) => {
              reject(
                addContextToErr(
                  err,
                  "unable to parse response despite passing verification"
                )
              );
            });
          return;
        }

        // Check for 404.
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < result.responsesFailed.length; i++) {
          if (result.responsesFailed[i].status === 404) {
            resolve(new Uint8Array(0));
            return;
          }
        }
        reject("unable to read registry entry\n" + JSON.stringify(result));
      });
  });
}
// tslint:disable-next-line:class-name
interface readRegistryEntryResult {
  exists: boolean;
  data: Uint8Array;
  revision: bigint;
}
// tslint:disable-next-line:class-name
interface registryReadResult {
  exists: boolean;
  entryData?: Uint8Array;
  revision?: bigint;
}
