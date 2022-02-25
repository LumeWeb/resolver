import { isDomain } from "../lib/util.js";
import resolver from "../index.js";
// @ts-ignore
import { NodeClient } from '@lumeweb/hs-client';
export default class Icann {
    async resolve(input, params = {}) {
        // @ts-ignore
        if (!params || !('subquery' in params) || !params.subquery) {
            return false;
        }
        if (!isDomain(input)) {
            return false;
        }
        const portal = resolver.getPortal();
        const clientOptions = {
            ssl: true,
            host: portal,
            port: 443,
            path: '/pocketdns',
            headers: {
                'X-Chain': 'icann',
            }
        };
        const client = new NodeClient(clientOptions);
        let resp = false;
        try {
            let rpcParams = {};
            // @ts-ignore
            rpcParams.domain = params.domain || input;
            // @ts-ignore
            rpcParams.nameserver = !params.domain ? null : input;
            // noinspection TypeScriptValidateJSTypes,JSVoidFunctionReturnValueUsed
            resp = await client.execute('dnslookup', rpcParams);
        }
        catch (e) {
            console.error(e);
            return false;
        }
        // @ts-ignore
        return resp.result;
    }
}
