import SubResolverBase from "../SubResolverBase.js";
export default class UnstoppableDomains extends SubResolverBase {
  resolve(
    input: string,
    params: {
      [p: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
  private getProviderConfig;
}
//# sourceMappingURL=unstoppableDomains.d.ts.map
