import ISubResolver from "./ISubResolver.js";
import Resolver from "./Resolver.js";

// @ts-ignore
export default abstract class SubResolverBase implements ISubResolver {
    protected resolver: Resolver;

    constructor(resolver: Resolver)  {
        this.resolver = resolver;
    }

    abstract resolve(input: string, params: object): Promise<string | boolean>;
}
