export function isIp(ip: string){
    return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
}

export function isDomain(domain: string){
    return /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/.test(domain);
}

export const startsWithSkylinkRegExp = /^(sia:\/\/)?([a-zA-Z0-9_-]{46})/;
export const registryEntryRegExp = /^skyns:\/\/(?<publickey>[a-zA-Z0-9%]+)\/(?<datakey>[a-zA-Z0-9%]+)$/;
