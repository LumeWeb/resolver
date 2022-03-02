import ISubResolver from "./ISubResolver";
import Resolver from "./Resolver";

// @ts-ignore
export default abstract class SubResolverBase implements ISubResolver {
    protected resolver: Resolver;

    constructor(resolver: Resolver)  {
        this.resolver = resolver;
    }

    abstract resolve(input: string, params: object): Promise<string | boolean>;
}
