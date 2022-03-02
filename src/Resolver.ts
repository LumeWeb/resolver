import ISubResolver from "./ISubResolver.js";
import SubResolverBase from "./SubResolverBase";

export default class Resolver {

    private _resolvers: SubResolverBase[] = [];
    private _portals: string[] = [];

    public async resolve(input: string, params: object = []): Promise<string | boolean> {
        for (let resolver of this._resolvers) {
            let result = await resolver.resolve(input, params);
            if (result) {
                return result;
            }
        }

        return false;
    }

    public registerResolver(resolver: SubResolverBase): void {
        this._resolvers.push(resolver);
    }

    public registerPortal(hostname: string): void {
        this._portals.push(hostname);
    }

    set portals(value: string[]) {
        this._portals = value;
    }

    public getPortal() {
        return this._portals[Math.floor(Math.random() * (1 + this._portals.length - 1))]
    }
}
