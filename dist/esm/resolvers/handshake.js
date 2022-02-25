import resolver from "../index.js";
import { isDomain, isIp, registryEntryRegExp, startsWithSkylinkRegExp } from "../lib/util.js";
import HnsClient from "./handshake/HnsClient.js";
import { SkynetClient } from "skynet-js";
//const {SkynetClient} = Skynet;
export default class Handshake {
    async resolve(input, params = {}) {
        let tld = input;
        if (isIp(input)) {
            return false;
        }
        if (input.endsWith('.eth')) {
            return false;
        }
        if (input.includes('.')) {
            tld = input.split('.')[input.split('.').length - 1];
        }
        let records = await Handshake.query(tld);
        if (!records) {
            return false;
        }
        let result = false;
        for (let record of records.reverse()) {
            // @ts-ignore
            switch (record.type) {
                case "NS": {
                    result = await Handshake.processNs(input, record, records);
                    break;
                }
                case "TXT": {
                    result = await Handshake.processTxt(record);
                    break;
                }
                // @ts-ignore
                default: {
                    // @ts-ignore
                    break;
                }
            }
            if (result) {
                break;
            }
        }
        return result;
    }
    // @ts-ignore
    static async processNs(domain, record, records) {
        // @ts-ignore
        let glue = records.slice().find(
        // @ts-ignore
        (item) => ['GLUE4', 'GLUE6'].includes(item.type) && item.ns === record.ns);
        if (glue) {
            return resolver.resolve(glue.address, { subquery: true, domain });
        }
        if (isDomain(record.ns)) {
            return resolver.resolve(record.ns, { subquery: true });
        }
        let result = await resolver.resolve(record.ns, { domain: domain });
        return result || record.ns;
    }
    static async query(tld) {
        const portal = resolver.getPortal();
        const clientOptions = {
            ssl: true,
            network: 'main',
            host: portal,
            port: 443,
            headers: {
                'X-Chain': 'hns',
            }
        };
        const client = new HnsClient(clientOptions);
        let resp;
        try {
            // noinspection TypeScriptValidateJSTypes,JSVoidFunctionReturnValueUsed
            resp = await client.execute('getnameresource', [tld]);
        }
        catch (e) {
            console.error(e);
            return false;
        }
        // @ts-ignore
        return resp?.result?.records || [];
    }
    static async processTxt(record) {
        // @ts-ignore
        let matches;
        // @ts-ignore
        if ((matches = record.txt.slice().pop().match(startsWithSkylinkRegExp))) {
            return decodeURIComponent(matches[2]);
        }
        // @ts-ignore
        if ((matches = record.txt.slice().pop().match(registryEntryRegExp))) {
            const client = new SkynetClient(`https://${resolver.getPortal()}`);
            let pubKey = decodeURIComponent(matches.groups.publickey).replace('ed25519:', '');
            let entry = await client.registry.getEntry(pubKey, matches.groups.datakey, 
            // @ts-ignore
            { hashedDataKeyHex: true });
            return Buffer.from(entry.entry?.data).toString();
        }
        return false;
    }
}
