import { Trade } from '@uniswap/v3-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import { Contract } from '@ethersproject/contracts'
import { pack } from '@ethersproject/solidity'
import SwapRouter02ABI from '../abis/SwapRouter02.json'

/**
 * Generates calldata for SwapRouter02 (without deadline parameter)
 * SwapRouter02 is different from the old SwapRouter - it doesn't have deadline!
 */
export function swapRouter02CallParameters(
  trade: Trade<Currency, Currency, TradeType>,
  options: {
    slippageTolerance: Percent
    recipient: string
  }
): { calldata: string; value: string } {
  const swapRouterInterface = new Contract('0x0000000000000000000000000000000000000000', SwapRouter02ABI.abi).interface

  // For single-hop trades
  if (trade.route.pools.length === 1) {
    const route = trade.route
    const pool = route.pools[0]

    if (trade.tradeType === TradeType.EXACT_INPUT) {
      const amountIn = trade.inputAmount.quotient.toString()
      const amountOutMinimum = trade.minimumAmountOut(options.slippageTolerance).quotient.toString()

      // SwapRouter02 exactInputSingle parameters (NO DEADLINE!)
      const params = {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: pool.fee,
        recipient: options.recipient,
        amountIn: amountIn,
        amountOutMinimum: amountOutMinimum,
        sqrtPriceLimitX96: 0,
      }

      const calldata = swapRouterInterface.encodeFunctionData('exactInputSingle', [params])
      // For ERC20 token swaps, value is always 0 (no native ETH/BNB sent)
      // Must be hex string format for ethers.js
      const value = '0x0'

      return { calldata, value }
    } else {
      // EXACT_OUTPUT
      const amountOut = trade.outputAmount.quotient.toString()
      const amountInMaximum = trade.maximumAmountIn(options.slippageTolerance).quotient.toString()

      const params = {
        tokenIn: route.tokenPath[0].address,
        tokenOut: route.tokenPath[1].address,
        fee: pool.fee,
        recipient: options.recipient,
        amountOut: amountOut,
        amountInMaximum: amountInMaximum,
        sqrtPriceLimitX96: 0,
      }

      const calldata = swapRouterInterface.encodeFunctionData('exactOutputSingle', [params])
      // For ERC20 token swaps, value is always 0
      // Must be hex string format for ethers.js
      const value = '0x0'

      return { calldata, value }
    }
  }

  // For multi-hop trades, use exactInput/exactOutput
  if (trade.tradeType === TradeType.EXACT_INPUT) {
    const amountIn = trade.inputAmount.quotient.toString()
    const amountOutMinimum = trade.minimumAmountOut(options.slippageTolerance).quotient.toString()

    // Encode path (false = not reversed for EXACT_INPUT)
    const path = encodeRouteToPath(trade.route, false)

    const params = {
      path: path,
      recipient: options.recipient,
      amountIn: amountIn,
      amountOutMinimum: amountOutMinimum,
    }

    const calldata = swapRouterInterface.encodeFunctionData('exactInput', [params])
    // For ERC20 token swaps, value is always 0
    // Must be hex string format for ethers.js
    const value = '0x0'

    return { calldata, value }
  } else {
    // EXACT_OUTPUT multi-hop
    const amountOut = trade.outputAmount.quotient.toString()
    const amountInMaximum = trade.maximumAmountIn(options.slippageTolerance).quotient.toString()

    const path = encodeRouteToPath(trade.route, true)

    const params = {
      path: path,
      recipient: options.recipient,
      amountOut: amountOut,
      amountInMaximum: amountInMaximum,
    }

    const calldata = swapRouterInterface.encodeFunctionData('exactOutput', [params])
    // For ERC20 token swaps, value is always 0
    // Must be hex string format for ethers.js
    const value = '0x0'

    return { calldata, value }
  }
}

// Helper to encode route path using solidityPack
function encodeRouteToPath(route: any, _exactOutput: boolean): string {
  const firstToken = route.tokenPath[0]
  const { path, types } = route.pools.reduce(
    (
      { path, types }: { path: (string | number)[]; types: string[] },
      pool: any,
      index: number
    ): { path: (string | number)[]; types: string[] } => {
      const outputToken = route.tokenPath[index + 1]
      if (index === 0) {
        return {
          path: [firstToken.address, pool.fee, outputToken.address],
          types: ['address', 'uint24', 'address'],
        }
      } else {
        return {
          path: [...path, pool.fee, outputToken.address],
          types: [...types, 'uint24', 'address'],
        }
      }
    },
    { path: [], types: [] }
  )

  return pack(types, path)
}
