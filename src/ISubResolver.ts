import Resolver from "./Resolver.js";

export default interface ISubResolver {
    // @ts-ignore
    constructor(resolver: Resolver);

    resolve(input: string, params: object): Promise<string | boolean>;
}
