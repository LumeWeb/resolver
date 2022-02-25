/*
import {hexToUint8Array, trimPrefix} from "skynet-js/dist/mjs/utils/string.js";
import {newEd25519PublicKey, newSkylinkV2} from "skynet-js/dist/mjs/skylink/sia.js";

const ED25519_PREFIX = "ed25519:";

export function getEntryLink(publicKey: string, dataKey: string): string {
    const siaPublicKey = newEd25519PublicKey(trimPrefix(publicKey, ED25519_PREFIX));
    let tweak = hexToUint8Array(dataKey);

    return newSkylinkV2(siaPublicKey, tweak).toString();
}
*/
import { encodePrefixedBytes } from "skynet-js/dist/mjs/utils/encoding";
const SPECIFIER_LEN = 16;
const PUBLIC_KEY_SIZE = 32;
export class SiaPublicKey {
    algorithm;
    key;
    constructor(algorithm, key) {
        this.algorithm = algorithm;
        this.key = key;
    }
    marshalSia() {
        const bytes = new Uint8Array(SPECIFIER_LEN + 8 + PUBLIC_KEY_SIZE);
        bytes.set(this.algorithm);
        bytes.set(encodePrefixedBytes(this.key), SPECIFIER_LEN);
        return bytes;
    }
}
