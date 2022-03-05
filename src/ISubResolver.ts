import Resolver from "./Resolver.js";

export default interface ISubResolver {
  // @ts-ignore
  // tslint:disable-next-line:no-misused-new
  constructor(resolver: Resolver);

  resolve(input: string, params: object): Promise<string | boolean>;
}
