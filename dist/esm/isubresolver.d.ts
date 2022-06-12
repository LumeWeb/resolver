import Resolver from "./resolver.js";
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
//# sourceMappingURL=isubresolver.d.ts.map
