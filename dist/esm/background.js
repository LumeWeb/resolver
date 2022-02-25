import browser from "webextension-polyfill";
import resolver from "./index";
import { isIp, startsWithSkylinkRegExp } from "./lib/util";
browser.webRequest.onBeforeRequest.addListener(maybeRedirectRequest, { urls: ['<all_urls>'] }, ["blocking"]);
browser.webRequest.onBeforeSendHeaders.addListener(maybeInjectContentHeader, { urls: ['<all_urls>'] }, ["blocking", "requestHeaders"]);
async function syncCache() {
    dnsCache = await browser.storage.local.get();
}
browser.runtime.onMessage.addListener(async function (data) {
    if ('resolve' === data.action) {
        if (!data.url || data.url.length === 0) {
            return false;
        }
    }
    else {
        return;
    }
    const originalUrl = new URL(data.url);
    const hostname = originalUrl.hostname;
    // @ts-ignore
    let target = await resolver.resolve(hostname);
    // @ts-ignore
    let redirect = originalUrl;
    const port = originalUrl.protocol == "https:" ? "443" : "80";
    const access = originalUrl.protocol == "https:" ? "HTTPS" : "PROXY";
    if (target) {
        target = target;
        let valid = false;
        let type;
        if (startsWithSkylinkRegExp.test(target)) {
            valid = true;
            type = 'content';
        }
        if (isIp(target)) {
            valid = true;
        }
        if (valid) {
            if (type === 'content') {
                await browser.storage.local.set({ [hostname]: target });
                await syncCache();
            }
            return target;
        }
    }
});
let dnsCache = {};
resolver.registerPortal('skynet.derrickhammer.com');
// @ts-ignore
function maybeInjectContentHeader(details) {
    const originalUrl = new URL(details.url);
    const hostname = originalUrl.hostname;
    // @ts-ignore
    let headers = [];
    if (hostname in dnsCache) {
        headers.push({ name: 'X-Content', value: dnsCache[hostname] });
    }
    return { requestHeaders: headers };
}
// @ts-ignore
function maybeRedirectRequest(details) {
    const originalUrl = new URL(details.url);
    const hostname = originalUrl.hostname;
    const port = originalUrl.protocol == "https:" ? "443" : "80";
    const access = originalUrl.protocol == "https:" ? "HTTPS" : "PROXY";
    const resolverDir = browser.runtime.getURL('/');
    const resolverPage = browser.runtime.getURL('/resolving.html');
    if (details.url.toLowerCase().includes(resolverDir) || details.url.toLowerCase().includes('pocket')) {
        return {};
    }
    if (!(hostname in dnsCache)) {
        let resolverPageUrl = new URL(resolverPage);
        resolverPageUrl.searchParams.append('url', encodeURI(originalUrl.toString()));
        return { redirectUrl: resolverPageUrl.toString() };
    }
    let portal = resolver.getPortal();
    const config = {
        mode: "pac_script",
        pacScript: {
            data: `function FindProxyForURL(url, host) {
                        alert(url + '  ' + host);
  if ('${portal}' === host){ return 'DIRECT';}
  if (host=== '${hostname}'){
    return '${access} ${portal}:${port}';}
  return 'DIRECT';
}`,
        },
    };
    console.log(JSON.stringify(config));
    browser.proxy.settings.set({ value: config, scope: "regular" });
}
