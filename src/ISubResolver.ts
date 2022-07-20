import Resolver from "./resolver.js";

export default interface ISubResolver {
  // @ts-ignore
  // tslint:disable-next-line:no-misused-new
  constructor(resolver: Resolver);

  resolve(
    input: string,
    params: { [key: string]: any },
    force: boolean
  ): Promise<string | boolean>;
}
