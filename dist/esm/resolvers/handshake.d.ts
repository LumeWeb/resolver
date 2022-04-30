import SubResolverBase from "../SubResolverBase.js";
import Resolver from "../Resolver.js";
export default class Handshake extends SubResolverBase {
  private tldBlacklist;
  constructor(resolver: Resolver);
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  private processNs;
  private processGlue;
  private query;
  private processTxt;
}
//# sourceMappingURL=handshake.d.ts.map
