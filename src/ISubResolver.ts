import Resolver from "./Resolver";

export default interface ISubResolver {
    // @ts-ignore
    constructor(resolver: Resolver);

    resolve(input: string, params: object): Promise<string | boolean>;
}
