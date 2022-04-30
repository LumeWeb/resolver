import SubResolverBase from "../SubResolverBase.js";
export default class Eip137 extends SubResolverBase {
  getSupportedTlds(): string[];
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  private resolveEns;
  private resolveHip5;
}
//# sourceMappingURL=eip137.d.ts.map
