import { Connection as SolanaConnection } from "@solana/web3.js";
import DnsNetwork from "../../dnsnetwork.js";
export default class Connection extends SolanaConnection {
  private _network;
  private _force;
  constructor(network: DnsNetwork, force?: boolean);
  __rpcRequest(methodName: string, args: any[]): Promise<any>;
}
//# sourceMappingURL=connection.d.ts.map
