import SubResolverBase from "../SubResolverBase.js";
import {
  getHashedName,
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
  async resolve(
    input: string,
    params: { [p: string]: any },
    force: boolean
  ): Promise<string | boolean> {
    if (!this.isTldSupported(input)) {
      return false;
    }

    const hashedName = await getHashedName(getSld(input));

    const domainKey = await getNameAccountKey(
      hashedName,
      undefined,
      SOL_TLD_AUTHORITY
    );

    const connection = new Connection(this.resolver.dnsNetwork);

    const nameAccount = await connection.getAccountInfo(domainKey, "processed");
    if (!nameAccount) {
      return false;
    }

    const res: NameRegistryState = deserializeUnchecked(
      NameRegistryState.schema,
      NameRegistryState,
      nameAccount.data
    );

    res.data = nameAccount.data?.slice(NameRegistryState.HEADER_LEN);

    const content = res.data.toString("ascii").replace(/\0/g, "");

    const skylink = await normalizeSkylink(content, this.resolver);

    if (skylink) {
      return skylink;
    }

    return content;
  }

  getSupportedTlds(): string[] {
    return ["sol"];
  }
}
