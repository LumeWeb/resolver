import SubResolverBase from "./SubResolverBase.js";
export default class Resolver {
  private _resolvers;
  private _portals;
  resolve(input: string, params?: object): Promise<string | boolean>;
  registerResolver(resolver: SubResolverBase): void;
  registerPortal(hostname: string): void;
  set portals(value: string[]);
  getPortal(): string;
}
//# sourceMappingURL=Resolver.d.ts.map
