// @ts-ignore
import { ethers } from "ethers";
import { normalizeSkylink } from "../lib/util.js";
import Resolver, { maybeGetContentHash } from "./eip137/resolver.js";
function isResponseEmpty(data) {
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
export default class Eip137 extends Resolver {
  getSupportedTlds() {
    return ["eth"];
  }
  async resolve(input, params = {}, force = false) {
    let resolve = await super.resolve(input, params, force);
    if (!resolve) {
      const hip5Data = input.split(".");
      // @ts-ignore
      if (2 <= hip5Data.length && "domain" in params) {
        if (ethers.utils.isAddress(hip5Data[0])) {
          // @ts-ignore
          resolve = this.resolveHip5(params.domain, hip5Data, force);
        }
      }
    }
    return resolve;
  }
  async resolveHip5(domain, params = {}, data, force = false) {
    params.chain = data[1].replace("_", "");
    const ens = this.getEns(this.getConnection(params, force));
    try {
      const name = await ens.name(domain);
      const content = maybeGetContentHash(name.getContent());
      let result = false;
      if (content) {
        result = content;
      }
      const skylink = await normalizeSkylink(result, this.resolver);
      if (skylink) {
        return skylink;
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
  getChain(params) {
    if (params.chain) {
      return params.chain;
    }
    return "eth";
  }
}
