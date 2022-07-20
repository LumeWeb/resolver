import SubResolverBase from "../../subResolverBase.js";
import pocketNetworks from "../../data/pocketNetworks.js";
import RpcProvider from "./rpcProvider.js";
import { normalizeSkylink } from "../../lib/util.js";
// @ts-ignore
import ENSRoot, { getEnsAddress } from "@lumeweb/ensjs";
const ENS = ENSRoot.default;
const networkMap = {
  eth: "eth-mainnet",
};
export default class Resolver extends SubResolverBase {
  getConnection(params = {}, force) {
    let chain = this.getChain(params);
    if (chain in networkMap) {
      chain = networkMap[chain];
    }
    if (chain in pocketNetworks) {
      chain = pocketNetworks[chain];
    }
    return new RpcProvider(chain, this.resolver.rpcNetwork, force);
  }
  getEns(provider) {
    return new ENS({ provider, ensAddress: getEnsAddress(1) });
  }
  async resolve(input, params = {}, force = false) {
    if (this.isTldSupported(input)) {
      return this.resolve137(input, params, force);
    }
    return false;
  }
  async resolve137(input, params = {}, force = false) {
    const ens = params.ens ?? this.getEns(this.getConnection(params, force));
    try {
      const name = await ens.name(input);
      const content = maybeGetContentHash(await name.getContent());
      let result = false;
      if (content) {
        result = content;
      }
      const skylink = await normalizeSkylink(result, this.resolver);
      if (skylink) {
        return skylink;
      }
      return result;
    } catch (e) {
      return false;
    }
  }
}
export function maybeGetContentHash(contentResult) {
  let content = false;
  if (
    typeof contentResult === "object" &&
    "contenthash" === contentResult.contentType
  ) {
    content = contentResult.value;
  }
  return content;
}
