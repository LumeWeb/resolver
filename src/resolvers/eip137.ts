// @ts-ignore
import ENSRoot, { getEnsAddress } from "@lumeweb/ensjs";
import { ethers } from "ethers";
import SubResolverBase from "../SubResolverBase.js";
import GunProvider from "./eip137/GunProvider.js";
import pocketNetworks from "../data/pocketNetworks.js";
import { isDomain, normalizeDomain } from "../lib/util.js";
// @ts-ignore
import tldEnum from "@lumeweb/tld-enum";

const ENS = ENSRoot.default;

const networkMap: { [key: string]: string } = {
  eth: "eth-mainnet",
};

function isResponseEmpty(data: any) {
  if (!data) {
    return true;
  }

  if (ethers.utils.isHexString(data)) {
    const normalizedData = ethers.utils.stripZeros(data).toString();
    if (!normalizedData) {
      return true;
    }
  }

  return false;
}

export default class Eip137 extends SubResolverBase {
  getSupportedTlds(): string[] {
    return ["eth"];
  }

  async resolve(
    input: string,
    params: { [key: string]: any } = {},
    force: boolean = false
  ): Promise<string | boolean> {
    if (this.isTldSupported(input)) {
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
    const data = [getEnsAddress("1"), networkMap.eth];

    return this.resolveHip5(input, data, force);
  }

  private async resolveHip5(
    domain: string,
    data: string[],
    force: boolean = false
  ): Promise<string | boolean> {
    let chain = data[1].replace("_", "");

    if (chain in networkMap) {
      chain = networkMap[chain];
    }
    if (chain in pocketNetworks) {
      chain = pocketNetworks[chain];
    }

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
      let content;
      let result: string | boolean = false;

      if (typeof contentResult === "string" && 0 === Number(contentResult)) {
        content = false;
      }

      if (
        typeof contentResult === "object" &&
        "contenthash" === contentResult.contentType
      ) {
        content = contentResult.value;
      }

      if (content) {
        result = content;
      }

      /*
                    Future DNS support
                   */
      /*if (isResponseEmpty(result)) {
                    result = await name.getText("A");
                  }

                  if (isResponseEmpty(result)) {
                    result = await name.getText("CNAME");
                  }

                  if (isResponseEmpty(result)) {
                    result = await name.getText("NS");
                    if (result) {
                      result = normalizeDomain(result as string);
                      let isIcann = false;
                      if (isDomain(result) || /[a-zA-Z0-9\-]+/.test(result)) {
                        if (result.includes(".")) {
                          const tld = result.split(".")[result.split(".").length - 1];
                          isIcann = tldEnum.list.includes(tld);
                        }

                        if (!isIcann) {
                          const evmNs = await this.resolver.resolve(result, { force });

                          if (result) {
                            return this.resolver.resolve(domain, {
                              subquery: true,
                              nameserver: evmNs,
                              force,
                            });
                          }
                        }

                        result = await this.resolver.resolve(
                          domain,
                          {
                            subquery: true,
                            nameserver: result,
                          },
                          force
                        );
                      }
                    }
                  }*/

      return result;
    } catch (e) {
      return false;
    }
  }
}
