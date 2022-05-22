import SubResolverBase from "../SubResolverBase.js";
export default class Algorand extends SubResolverBase {
  getSupportedTlds(): string[];
  resolve(
    input: string,
    params: {
      [p: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
}
//# sourceMappingURL=algorand.d.ts.map
