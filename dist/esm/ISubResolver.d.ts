import Resolver from "./Resolver.js";
export default interface ISubResolver {
  constructor(resolver: Resolver): any;
  resolve(
    input: string,
    params: {
      [key: string]: any;
    },
    force: boolean
  ): Promise<string | boolean>;
}
//# sourceMappingURL=ISubResolver.d.ts.map
