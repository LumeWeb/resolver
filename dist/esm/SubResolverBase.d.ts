import ISubResolver from "./ISubResolver.js";
import Resolver from "./Resolver.js";
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
//# sourceMappingURL=SubResolverBase.d.ts.map
