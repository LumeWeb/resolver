import SubResolverBase from "../../subResolverBase.js";
import RpcProvider from "./rpcProvider.js";
export default abstract class Resolver extends SubResolverBase {
  protected abstract getChain(params: { [p: string]: any }): string;
  protected getConnection(
    params:
      | {
          [key: string]: any;
        }
      | undefined,
    force: boolean
  ): RpcProvider;
  protected getEns(provider: RpcProvider): any;
  resolve(
    input: string,
    params?: {
      [key: string]: any;
    },
    force?: boolean
  ): Promise<string | boolean>;
  private resolve137;
}
export declare function maybeGetContentHash(
  contentResult: any
): string | boolean;
//# sourceMappingURL=resolver.d.ts.map
