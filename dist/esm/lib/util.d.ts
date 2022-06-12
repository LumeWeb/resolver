import Resolver from "../resolver.js";
export declare function isIp(ip: string): boolean;
export declare function isDomain(domain: string): boolean;
export declare const startsWithSkylinkRegExp: RegExp;
export declare const registryEntryRegExp: RegExp;
export declare function normalizeDomain(domain: string): string;
export declare function normalizeSkylink(
  skylink: string,
  resolver: Resolver
): Promise<string | boolean>;
export declare function getTld(domain: string): string;
export declare function getSld(domain: string): string;
//# sourceMappingURL=util.d.ts.map
