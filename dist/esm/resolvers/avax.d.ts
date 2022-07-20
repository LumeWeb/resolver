import SubResolverBase from "../subResolverBase.js";
export default class Avax extends SubResolverBase {
  getSupportedTlds(): string[];
  resolve(
    input: string,
    params: {
      [p: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
}
//# sourceMappingURL=avax.d.ts.map
