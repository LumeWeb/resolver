import SubResolverBase from "../SubResolverBase.js";
export default class Eip137 extends SubResolverBase {
  resolve(input: string, params?: object): Promise<string | boolean>;
  private resolveEns;
  private resolveHip5;
  private getConnection;
}
//# sourceMappingURL=eip137.d.ts.map
