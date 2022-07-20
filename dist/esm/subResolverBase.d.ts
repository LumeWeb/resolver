import ISubResolver from "./ISubResolver.js";
import Resolver from "./resolver.js";
export default abstract class SubResolverBase implements ISubResolver {
  protected resolver: Resolver;
  constructor(resolver: Resolver);
  abstract resolve(
    input: string,
    params: {
      [key: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
  getSupportedTlds(): string[];
  isTldSupported(domain: string): boolean;
}
//# sourceMappingURL=subResolverBase.d.ts.map
