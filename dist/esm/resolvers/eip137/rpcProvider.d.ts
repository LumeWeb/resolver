import * as ethers from "ethers";
import * as ethersNetwork from "@ethersproject/networks";
import * as ethersTransactions from "@ethersproject/transactions";
import * as ethersProperties from "@ethersproject/properties";
import * as ethersAbstractProvider from "@ethersproject/abstract-provider";
import * as ethersAbstractSigner from "@ethersproject/abstract-signer";
import { RpcNetwork } from "@lumeweb/dht-rpc-client";
export default class RpcProvider extends ethers.providers.BaseProvider {
  private _dnsChain;
  private _rpcNetwork;
  private _force;
  constructor(dnsChain: string, dnsNetwork: RpcNetwork, force?: boolean);
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
  getSigner(addressOrIndex?: string | number): RpcSigner;
}
declare class RpcSigner extends ethersAbstractSigner.Signer {
  readonly provider: RpcProvider;
  private _index;
  private _address;
  constructor(provider: RpcProvider, addressOrIndex?: string | number);
  connect(provider: RpcProvider): RpcSigner;
  getAddress(): Promise<string>;
  sendUncheckedTransaction(
    transaction: ethersProperties.Deferrable<ethersAbstractProvider.TransactionRequest>
  ): Promise<string>;
  signTransaction(
    transaction: ethersProperties.Deferrable<ethersAbstractProvider.TransactionRequest>
  ): Promise<string>;
  sendTransaction(
    transaction: ethersProperties.Deferrable<ethersAbstractProvider.TransactionRequest>
  ): Promise<ethersAbstractProvider.TransactionResponse>;
  signMessage(message: ethers.Bytes | string): Promise<string>;
  _legacySignMessage(message: ethers.Bytes | string): Promise<string>;
  _signTypedData(
    domain: ethersAbstractSigner.TypedDataDomain,
    types: Record<string, ethersAbstractSigner.TypedDataField[]>,
    value: Record<string, any>
  ): Promise<string>;
  unlock(password: string): Promise<boolean>;
}
export {};
//# sourceMappingURL=rpcProvider.d.ts.map
