import { ChainId } from '@uniswap/sdk-core'

export function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks?: { [chainId: number]: T }
): { [chainId in ChainId]: T } & { [chainId: number]: T } {
  const baseMap = {
    [ChainId.MAINNET]: address,
    [ChainId.ROPSTEN]: address,
    [ChainId.KOVAN]: address,
    [ChainId.RINKEBY]: address,
    [ChainId.GÖRLI]: address,
  }
  return additionalNetworks ? { ...baseMap, ...additionalNetworks } : baseMap
}
