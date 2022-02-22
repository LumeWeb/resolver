export default interface SubResolver {
   // validate(input: string, params: object): boolean;
    resolve(input: string, params: object): Promise<string | boolean>;
}
