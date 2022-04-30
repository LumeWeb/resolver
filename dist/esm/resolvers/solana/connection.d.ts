import { Connection as SolanaConnection } from "@solana/web3.js";
import DnsNetwork from "../../DnsNetwork.js";
export default class Connection extends SolanaConnection {
  private network;
  constructor(network: DnsNetwork);
  __rpcRequest(methodName: string, args: any[]): Promise<any>;
}
//# sourceMappingURL=connection.d.ts.map
