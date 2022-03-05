// @ts-ignore
import ENSRoot, { getEnsAddress } from "@lumeweb/ensjs";
import { ethers, providers } from "ethers";
import URL from "url";
// @ts-ignore
import contentHasher from "content-hash";
// @ts-ignore
import { profiles as contentHashProfiles } from "content-hash/src/profiles.js";
// @ts-ignore
import { encodeContenthash } from "@lumeweb/ensjs/dist/utils/contents.js";
import SubResolverBase from "../SubResolverBase.js";

const ENS = ENSRoot.default;

export default class Eip137 extends SubResolverBase {
  async resolve(input: string, params: object = {}): Promise<string | boolean> {
    if (input.endsWith(".eth")) {
      return this.resolveEns(input);
    }

    const hip5Data = input.split(".");
    // @ts-ignore
    if (2 <= hip5Data.length && "domain" in params) {
      if (ethers.utils.isAddress(hip5Data[0])) {
        // @ts-ignore
        return this.resolveHip5(params.domain, hip5Data);
      }
    }

    return false;
  }

  private async resolveEns(input: string): Promise<string | boolean> {
    const data = [getEnsAddress("1"), "eth-mainnet"];

    return this.resolveHip5(input, data);
  }

  private async resolveHip5(
    domain: string,
    data: string[]
  ): Promise<string | boolean> {
    const connection: providers.StaticJsonRpcProvider = this.getConnection(
      data[1].replace("_", "")
    );

    // @ts-ignore
    const ens = new ENS({ provider: connection, ensAddress: data[0] });

    try {
      const name = await ens.name(domain);
      const contentResult = await name.getContent();
      const url = await name.getText("url");
      let content;

      if (typeof contentResult === "string" && 0 === Number(contentResult)) {
        content = false;
      }

      if (
        typeof contentResult === "object" &&
        "contenthash" === contentResult.contentType
      ) {
        content = contentResult.value;
      }

      return content || url || false;
    } catch (e) {
      return false;
    }
  }

  private getConnection(chain: string): providers.StaticJsonRpcProvider {
    // @ts-ignore
    const apiUrl = new URL.URL(
      `https://${this.resolver.getPortal()}/pocketdns`
    );
    if (URL.URLSearchParams) {
      const params = new URL.URLSearchParams();
      params.set("chain", chain);
      apiUrl.search = params.toString();
    } else {
      apiUrl.search = `?chain=${chain}`;
    }
    return new ethers.providers.StaticJsonRpcProvider({
      // @ts-ignore
      url: apiUrl.toString(),
    });
  }
}
