// @ts-ignore
import ENSRoot, { getEnsAddress } from "@lumeweb/ensjs";
import { ethers } from "ethers";
import SubResolverBase from "../SubResolverBase.js";
import GunProvider from "./eip137/GunProvider.js";

const ENS = ENSRoot.default;

export default class Eip137 extends SubResolverBase {
  async resolve(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    if (input.endsWith(".eth")) {
      return this.resolveEns(input, force);
    }

    const hip5Data = input.split(".");
    // @ts-ignore
    if (2 <= hip5Data.length && "domain" in params) {
      if (ethers.utils.isAddress(hip5Data[0])) {
        // @ts-ignore
        return this.resolveHip5(params.domain, hip5Data, force);
      }
    }

    return false;
  }

  private async resolveEns(
    input: string,
    force: boolean = false
  ): Promise<string | boolean> {
    const data = [getEnsAddress("1"), "eth-mainnet"];

    return this.resolveHip5(input, data, force);
  }

  private async resolveHip5(
    domain: string,
    data: string[],
    force: boolean = false
  ): Promise<string | boolean> {
    const chain = data[1].replace("_", "");

    const connection: GunProvider = new GunProvider(
      chain,
      this.resolver.dnsNetwork,
      force
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
}
