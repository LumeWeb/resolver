import Resolver from "./eip137/resolver.js";
import pocketNetworks from "../data/pocketNetworks.js";

// @ts-ignore
import ENSRoot from "@lumeweb/ensjs";
import GunProvider from "./eip137/gunprovider.js";

const ENS = ENSRoot.default;

export default class Evmos extends Resolver {
  protected getEns(provider: GunProvider): any {
    return new ENS({
      provider,
      ensAddress: "0xae9Da235A2276CAa3f6484ad8F0EFbF4e0d45246",
    });
  }

  getSupportedTlds(): string[] {
    return ["evmos"];
  }

  protected getChain(params: { [p: string]: any }): string {
    return pocketNetworks["evmos-mainnet"];
  }
}
