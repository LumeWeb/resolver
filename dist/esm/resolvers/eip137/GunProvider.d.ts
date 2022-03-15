import * as ethers from "ethers";
import * as ethersNetwork from "@ethersproject/networks";
import * as ethersTransactions from "@ethersproject/transactions";
import DnsNetwork from "../../DnsNetwork.js";
export default class GunProvider extends ethers.providers.BaseProvider {
  private _dnsChain;
  private _dnsNetwork;
  constructor(dnsChain: string, dnsNetwork: DnsNetwork);
  detectNetwork(): Promise<ethersNetwork.Network>;
  send(method: string, params: any[]): Promise<any>;
  prepareRequest(method: string, params: any): [string, any[]] | null;
  perform(method: string, params: any): Promise<any>;
  static hexlifyTransaction(
    transaction: ethers.providers.TransactionRequest,
    allowExtra?: {
      [key: string]: boolean;
    }
  ): {
    [key: string]: string | ethersTransactions.AccessList;
  };
}
//# sourceMappingURL=GunProvider.d.ts.map
