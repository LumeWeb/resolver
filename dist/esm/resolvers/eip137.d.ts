import SubResolver from "../SubResolver.js";
export default class Eip137 implements SubResolver {
    resolve(input: string, params?: object): Promise<string | boolean>;
    private resolveEns;
    private resolveHip5;
    private getConnection;
}
//# sourceMappingURL=eip137.d.ts.map