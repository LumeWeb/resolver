import SubResolverBase from "../../SubResolverBase.js";
import pocketNetworks from "../../data/pocketNetworks.js";
import GunProvider from "./GunProvider.js";
import { normalizeSkylink } from "../../lib/util.js";
// @ts-ignore
import ENSRoot, { getEnsAddress } from "@lumeweb/ensjs";

const ENS = ENSRoot.default;

const networkMap: { [key: string]: string } = {
  eth: "eth-mainnet",
};

export default abstract class Resolver extends SubResolverBase {
  protected abstract getChain(params: { [p: string]: any }): string;

  protected getConnection(
    params: { [key: string]: any } = {},
    force: boolean
  ): GunProvider {
    let chain = this.getChain(params);

    if (chain in networkMap) {
      chain = networkMap[chain];
    }
    if (chain in pocketNetworks) {
      chain = pocketNetworks[chain];
    }

    return new GunProvider(chain, this.resolver.dnsNetwork, force);
  }

  protected getEns(provider: GunProvider): any {
    return new ENS({ provider, ensAddress: getEnsAddress(1) });
  }

  async resolve(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    if (this.isTldSupported(input)) {
      return this.resolve137(input, params, force);
    }

    return false;
  }

  private async resolve137(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    const ens = params.ens ?? this.getEns(this.getConnection(params, force));

    try {
      const name = await ens.name(input);
      const content = maybeGetContentHash(await name.getContent());
      let result: string | boolean = false;

      if (content) {
        result = content;
      }

      const skylink = await normalizeSkylink(result as string, this.resolver);

      if (skylink) {
        return skylink;
      }

      return result;
    } catch (e) {
      return false;
    }
  }
}

export function maybeGetContentHash(contentResult: any): string | boolean {
  let content = false;

  if (
    typeof contentResult === "object" &&
    "contenthash" === contentResult.contentType
  ) {
    content = contentResult.value;
  }

  return content;
}
