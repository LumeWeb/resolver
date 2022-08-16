import SubResolverBase from "../subResolverBase.js";
import {
  getHashedName,
  getIpfsRecord,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";
import Connection from "./solana/connection.js";
import { deserializeUnchecked } from "borsh";
import { getSld, normalizeSkylink } from "../lib/util.js";
const SOL_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);
export default class Solana extends SubResolverBase {
  async resolve(input, params, force) {
    if (!this.isTldSupported(input)) {
      return false;
    }
    const connection = new Connection(this.resolver.rpcNetwork, force);
    let ipfs;
    try {
      ipfs = await getIpfsRecord(connection, getSld(input));
    } catch (e) {
      //
    }
    if (ipfs && ipfs?.data) {
      return ipfs?.data.toString("utf-8");
    }
    const hashedName = await getHashedName(getSld(input));
    const domainKey = await getNameAccountKey(
      hashedName,
      undefined,
      SOL_TLD_AUTHORITY
    );
    const nameAccount = await connection.getAccountInfo(domainKey, "processed");
    if (!nameAccount) {
      return false;
    }
    const res = deserializeUnchecked(
      NameRegistryState.schema,
      NameRegistryState,
      nameAccount.data
    );
    res.data = nameAccount.data?.slice(NameRegistryState.HEADER_LEN);
    let content = res.data.toString("ascii").replace(/\0/g, "");
    if (content.includes("=")) {
      content = content.split("=")[0];
    }
    const skylink = await normalizeSkylink(content, this.resolver);
    if (skylink) {
      return skylink;
    }
    return content;
  }
  getSupportedTlds() {
    return ["sol"];
  }
}
