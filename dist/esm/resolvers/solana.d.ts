import SubResolverBase from "../SubResolverBase.js";
export default class Solana extends SubResolverBase {
  resolve(
    input: string,
    params: {
      [p: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
  getSupportedTlds(): string[];
}
//# sourceMappingURL=solana.d.ts.map
