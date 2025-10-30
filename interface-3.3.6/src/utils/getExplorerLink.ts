import { SupportedChainId } from '../constants/chains'

const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
}

const BSC_URLS: { [chainId: number]: string } = {
  [SupportedChainId.BSC_TESTNET]: 'https://testnet.bscscan.com',
}

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(chainId: number, data: string, type: ExplorerDataType): string {
  // Check if it's a BSC chain
  const bscUrl = BSC_URLS[chainId]
  const prefix = bscUrl || `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`
    }
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`
    }
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`
    }
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
