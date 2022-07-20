import { Connection as SolanaConnection } from "@solana/web3.js";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export default class Connection extends SolanaConnection {
  private _network;
  private _force;
  constructor(network: RpcNetwork, force?: boolean);
  __rpcRequest(methodName: string, args: any[]): Promise<any>;
}
//# sourceMappingURL=connection.d.ts.map
