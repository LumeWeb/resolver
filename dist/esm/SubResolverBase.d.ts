import ISubResolver from "./ISubResolver.js";
import Resolver from "./Resolver.js";
export default abstract class SubResolverBase implements ISubResolver {
  protected resolver: Resolver;
  constructor(resolver: Resolver);
  abstract resolve(input: string, params: object): Promise<string | boolean>;
}
//# sourceMappingURL=SubResolverBase.d.ts.map
