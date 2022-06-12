import Resolver from "./eip137/resolver.js";
export default class Eip137 extends Resolver {
  getSupportedTlds(): string[];
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  private resolveHip5;
  protected getChain(params: { [key: string]: any }): string;
}
//# sourceMappingURL=eip137.d.ts.map
