import { getTld } from "./lib/util.js";
// @ts-ignore
export default class SubResolverBase {
  resolver;
  constructor(resolver) {
    this.resolver = resolver;
  }
  getSupportedTlds() {
    return [];
  }
  isTldSupported(domain) {
    return this.getSupportedTlds().includes(getTld(domain));
  }
}
