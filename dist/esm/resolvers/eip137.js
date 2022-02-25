import resolver from "../index.js";
// @ts-ignore
import ENSRoot, { getEnsAddress } from '@lumeweb/ensjs';
import { ethers } from "ethers";
import * as URL from "url";
const ENS = ENSRoot.default;
export default class Eip137 {
    async resolve(input, params = {}) {
        if (input.endsWith('.eth')) {
            return await this.resolveEns(input);
        }
        let hip5Data = input.split('.');
        // @ts-ignore
        if (2 <= hip5Data.length && 'domain' in params) {
            if (ethers.utils.isAddress(hip5Data[0])) {
                // @ts-ignore
                return await this.resolveHip5(params.domain, hip5Data);
            }
        }
        return false;
    }
    async resolveEns(input) {
        let data = [getEnsAddress('1'), 'eth-mainnet'];
        return this.resolveHip5(input, data);
    }
    async resolveHip5(domain, data) {
        let connection = this.getConnection(data[1].replace('_', ''));
        // @ts-ignore
        const ens = new ENS({ provider: connection, ensAddress: data[0] });
        try {
            let name = await ens.name(domain);
            let contentResult = await name.getContent();
            let url = await name.getText('url');
            let content;
            if (typeof contentResult === 'string' && 0 === Number(contentResult)) {
                content = false;
            }
            if (typeof contentResult === 'object' && 'contenthash' === contentResult.contentType) {
                content = contentResult.value;
            }
            return content || url || false;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    getConnection(chain) {
        // @ts-ignore
        let apiUrl = URL.parse(`https://${resolver.getPortal()}/pocketdns`);
        if (URL.URLSearchParams) {
            let params = new URL.URLSearchParams;
            params.set('chain', chain);
            apiUrl.search = params.toString();
        }
        else {
            apiUrl.search = `?chain=${chain}`;
        }
        return new ethers.providers.StaticJsonRpcProvider({
            // @ts-ignore
            url: apiUrl.format()
        });
    }
}
