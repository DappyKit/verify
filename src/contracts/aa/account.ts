import { BytesLike, concat, Contract, ContractTransactionResponse, HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers'
import { getSimpleAccountFactoryContract } from '../simple-account-factory'

/**
 * Connection object interface
 */
export interface IConnection {
  /**
   * RPC URL
   */
  rpcUrl: string

  /**
   * Account factory address
   */
  accountFactoryAddress: string

  /**
   * Entry point address
   */
  entryPointAddress: string
}

/**
 * Error object for account address retrieval
 */
export interface IAccountError {
  message: string
  revert: {
    args: string[]
  }
}

/**
 * Get the init code for creating a smart account
 * @param accountFactoryAddress Address of the account factory
 * @param owner Address of the owner
 * @param salt Salt for the smart account
 */
export function getAccountInitCode(accountFactoryAddress: string, owner: string, salt = 0): BytesLike {
  const factory = getSimpleAccountFactoryContract(accountFactoryAddress)
  const data = factory.interface.encodeFunctionData('createAccount', [owner, salt])

  return concat([accountFactoryAddress, data])
}

/**
 * Get the simple smart account address
 * @param connection Connection object
 * @param eoaAddress Address of the EOA
 */
export async function getSimpleSmartAccountAddress(connection: IConnection, eoaAddress: string): Promise<string> {
  const { rpcUrl, accountFactoryAddress, entryPointAddress } = connection

  if (!(rpcUrl && accountFactoryAddress && entryPointAddress && eoaAddress)) {
    throw new Error('rpcUrl, accountFactoryAddress, entryPointAddress, and eoaAddress are required')
  }

  const factory = getSimpleAccountFactoryContract(accountFactoryAddress, rpcUrl)
  const method = 'getAddress(address,uint256)'

  return factory[method].staticCall(eoaAddress, '0')
}

/**
 * Deploy the simple smart account
 * @param serviceWallet Wallet of the service which deploys the smart account
 * @param connection Connection object
 * @param eoaAddress Address of the EOA
 */
export async function deploySimpleSmartAccount(
  serviceWallet: HDNodeWallet | Wallet,
  connection: IConnection,
  eoaAddress: string,
): Promise<ContractTransactionResponse> {
  const { rpcUrl, accountFactoryAddress } = connection

  if (!(rpcUrl && accountFactoryAddress && eoaAddress)) {
    throw new Error('rpcUrl, accountFactoryAddress and eoaAddress are required')
  }

  const factory = getSimpleAccountFactoryContract(accountFactoryAddress, rpcUrl, serviceWallet)

  return factory.createAccount(eoaAddress, '0')
}

/**
 * Check if the contract is deployed
 * @param rpcUrl RPC URL
 * @param address Address of the contract
 */
export async function isContractDeployed(rpcUrl: string, address: string): Promise<boolean> {
  const contract = new Contract(address, [], new JsonRpcProvider(rpcUrl))

  return (await contract.getDeployedCode()) !== null
}
