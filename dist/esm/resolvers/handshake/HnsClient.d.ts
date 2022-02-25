import { NodeClient } from "@lumeweb/hs-client";
export default class HnsClient extends NodeClient {
    constructor(options: object);
    execute(name: string, params: any[]): Promise<object>;
}
//# sourceMappingURL=HnsClient.d.ts.map