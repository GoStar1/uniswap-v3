/**
 * Extended chain IDs to support additional networks beyond the SDK defaults
 */
export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  BSC_TESTNET = 97,
}

export const CHAIN_INFO: {
  [chainId: number]: {
    name: string
    explorer: string
    label: string
    nativeCurrency: {
      name: string
      symbol: string
      decimals: number
    }
  }
} = {
  [SupportedChainId.MAINNET]: {
    name: 'Ethereum Mainnet',
    explorer: 'https://etherscan.io',
    label: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.RINKEBY]: {
    name: 'Rinkeby',
    explorer: 'https://rinkeby.etherscan.io',
    label: 'Rinkeby',
    nativeCurrency: { name: 'Rinkeby Ether', symbol: 'RIN', decimals: 18 },
  },
  [SupportedChainId.ROPSTEN]: {
    name: 'Ropsten',
    explorer: 'https://ropsten.etherscan.io',
    label: 'Ropsten',
    nativeCurrency: { name: 'Ropsten Ether', symbol: 'ROP', decimals: 18 },
  },
  [SupportedChainId.KOVAN]: {
    name: 'Kovan',
    explorer: 'https://kovan.etherscan.io',
    label: 'Kovan',
    nativeCurrency: { name: 'Kovan Ether', symbol: 'KOV', decimals: 18 },
  },
  [SupportedChainId.GÖRLI]: {
    name: 'Görli',
    explorer: 'https://goerli.etherscan.io',
    label: 'Görli',
    nativeCurrency: { name: 'Görli Ether', symbol: 'GOR', decimals: 18 },
  },
  [SupportedChainId.BSC_TESTNET]: {
    name: 'BSC Testnet',
    explorer: 'https://testnet.bscscan.com',
    label: 'BSC Testnet',
    nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
  },
}
