import ISubResolver from "./ISubResolver.js";
import Resolver from "./Resolver.js";
import { getTld } from "./lib/util.js";

// @ts-ignore
export default abstract class SubResolverBase implements ISubResolver {
  protected resolver: Resolver;

  constructor(resolver: Resolver) {
    this.resolver = resolver;
  }

  abstract resolve(
    input: string,
    params: { [key: string]: any },
    force: boolean
  ): Promise<string | boolean>;

  getSupportedTlds(): string[] {
    return [];
  }

  isTldSupported(domain: string): boolean {
    return this.getSupportedTlds().includes(getTld(domain));
  }
}
