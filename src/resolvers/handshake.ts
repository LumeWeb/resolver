import SubResolver from "../SubResolver.js";
import resolver from "../index.js";
import {isDomain, isIp, registryEntryRegExp, startsWithSkylinkRegExp} from "../lib/util.js";

// @ts-ignore
import {NodeClient} from "hs-client";
import HnsClient from "./handshake/HnsClient.js";
import {SkynetClient} from "skynet-js";

//const {SkynetClient} = Skynet;

export default class Handshake implements SubResolver {
    async resolve(input: string, params: object = {}): Promise<string | boolean> {
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
        let result: string | boolean = false;

        for (let record of (<object[]>records).reverse()) {
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
    private static async processNs(domain, record, records) {
        // @ts-ignore
        let glue = records.slice().find(
            // @ts-ignore
            (item: object) => ['GLUE4', 'GLUE6'].includes(item.type) && item.ns === record.ns);

        if (glue) {
            return resolver.resolve(glue.address, {subquery: true, domain});
        }

        if (isDomain(record.ns)) {
            return resolver.resolve(record.ns, {subquery: true});
        }

        let result = await resolver.resolve(record.ns, {domain: domain});

        return result || record.ns;
    }

    private static async query(tld: string): Promise<object | boolean> {
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
        } catch (e) {
            console.error(e);
            return false;
        }

        // @ts-ignore
        return resp?.result?.records || [];
    }

    private static async processTxt(record: object): Promise<string | boolean> {
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

            let entry = await client.registry.getEntry(pubKey,
                                                       matches.groups.datakey,
                                                       // @ts-ignore
                                                       {hashedDataKeyHex: true});

            return Buffer.from(<Uint8Array>entry.entry?.data).toString()
        }

        return false;
    }
}
