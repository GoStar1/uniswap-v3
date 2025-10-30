# BSC Testnet 支持状态

## ✅ 已修复的问题

### 问题 1: tokenMap 访问错误
**错误信息**: `TypeError: Cannot convert undefined or null to object`

**位置**: `src/hooks/Tokens.ts:25`

**原因**: 当切换到 BSC Testnet 时，`tokenMap[chainId]` 返回 undefined，导致 `Object.keys()` 抛出错误。

**解决方案**:
在 `useTokensFromMap` 函数中添加了 chainId 存在性检查：
```typescript
// Check if tokenMap exists for this chainId
if (!tokenMap[chainId]) return {}
```

**状态**: ✅ 已修复

## 🔄 当前功能状态

### ✅ 可用功能
1. **钱包连接**: 可以正常连接到 BSC Testnet
2. **网络切换**: 可以在不同网络之间切换
3. **区块浏览器**: 支持查看 BSCScan Testnet
4. **基础界面**: 界面正常显示，不会崩溃

### ⚠️ 部分可用功能
以下功能在 BSC Testnet 上会返回 undefined，但不会导致错误：
1. **合约地址映射**:
   - `NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[97]` → undefined
   - `V2_ROUTER_ADDRESS[97]` → undefined
   - `V3_CORE_FACTORY_ADDRESSES[97]` → undefined
   - 等等...

2. **代币列表**: BSC Testnet 没有配置的代币列表

### ❌ 不可用功能
1. **交易功能**: 需要部署合约或配置合约地址
2. **流动性管理**: 需要 Position Manager 合约
3. **代币交换**: 需要 Router 和 Factory 合约
4. **池子查询**: 需要 Factory 合约

## 📋 完全支持 BSC Testnet 所需的步骤

### 1. 部署或使用现有合约

如果 BSC Testnet 上已有 Uniswap V3 兼容的 DEX，可以使用其合约地址。否则需要部署：

- Uniswap V3 Core Factory
- Uniswap V3 Router
- Nonfungible Position Manager
- Quoter
- Multicall2
- 其他必要合约

### 2. 更新合约地址配置

在 `src/constants/addresses.ts` 中为 BSC Testnet 添加合约地址：

```typescript
import { SupportedChainId } from './chains'

export const V3_CORE_FACTORY_ADDRESSES = {
  ...constructSameAddressMap(V3_FACTORY_ADDRESS),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet Factory 地址
}

export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES = {
  ...constructSameAddressMap('0xC36442b4a4522E871399CD717aBDD847Ab11FE88'),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet Position Manager 地址
}

export const SWAP_ROUTER_ADDRESSES = {
  ...constructSameAddressMap('0xE592427A0AEce92De3Edee1F18E0157C05861564'),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet Router 地址
}

export const QUOTER_ADDRESSES = {
  ...constructSameAddressMap('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet Quoter 地址
}

export const MULTICALL2_ADDRESSES = {
  ...constructSameAddressMap('0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet Multicall2 地址
}

// V2 相关（如果需要）
export const V2_ROUTER_ADDRESS = {
  ...constructSameAddressMap('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'),
  [SupportedChainId.BSC_TESTNET]: '0x...', // BSC Testnet V2 Router 地址
}
```

### 3. 配置代币列表

在 `src/constants/tokens.ts` 中添加 BSC Testnet 的常用代币：

```typescript
import { SupportedChainId } from './chains'

// WBNB for BSC Testnet
export const WBNB_BSC_TESTNET = new Token(
  SupportedChainId.BSC_TESTNET,
  '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', // WBNB 测试网地址
  18,
  'WBNB',
  'Wrapped BNB'
)

// USDT for BSC Testnet
export const USDT_BSC_TESTNET = new Token(
  SupportedChainId.BSC_TESTNET,
  '0x...', // USDT 测试网地址
  18,
  'USDT',
  'Tether USD'
)

// 更新现有的代币映射
export const WETH9_EXTENDED: { [chainId: number]: Token } = {
  ...WETH9,
  [SupportedChainId.BSC_TESTNET]: WBNB_BSC_TESTNET,
}
```

### 4. 添加代币列表支持

创建或引用 BSC Testnet 的代币列表 JSON：

```typescript
// src/constants/lists.ts
export const DEFAULT_TOKEN_LIST_URL = 'tokens.uniswap.org'

// 添加 BSC Testnet 代币列表
export const BSC_TESTNET_TOKEN_LIST_URL = 'https://...'
```

### 5. 更新原生货币处理

在需要处理原生货币的地方，确保正确处理 BNB：

```typescript
// 示例：在 src/utils/wrappedCurrency.ts 或类似文件中
import { SupportedChainId } from '../constants/chains'

export function nativeCurrency(chainId: number): Currency {
  switch (chainId) {
    case SupportedChainId.BSC_TESTNET:
      return new Token(
        SupportedChainId.BSC_TESTNET,
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        18,
        'BNB',
        'BNB'
      )
    default:
      return ETHER
  }
}
```

### 6. 更新构造函数辅助工具

修改 `src/utils/constructSameAddressMap.ts`（如果存在）以支持扩展的 ChainId：

```typescript
import { ChainId } from '@uniswap/sdk-core'
import { SupportedChainId } from '../constants/chains'

export function constructSameAddressMap(
  address: string,
  additionalChains?: number[]
): { [chainId: number]: string } {
  const chains = [
    ChainId.MAINNET,
    ChainId.ROPSTEN,
    ChainId.RINKEBY,
    ChainId.GÖRLI,
    ChainId.KOVAN,
    ...(additionalChains || [])
  ]

  return chains.reduce<{ [chainId: number]: string }>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}
```

## 🧪 测试清单

在完成配置后，测试以下功能：

- [ ] 钱包连接到 BSC Testnet
- [ ] 网络切换
- [ ] 代币余额显示
- [ ] 代币搜索和选择
- [ ] 交换功能（如果配置了合约）
- [ ] 流动性添加（如果配置了合约）
- [ ] 流动性移除（如果配置了合约）
- [ ] 交易历史查看
- [ ] 区块浏览器链接

## 📚 参考资源

### BSC Testnet 信息
- **Chain ID**: 97
- **RPC**: https://data-seed-prebsc-1-s1.binance.org:8545/
- **浏览器**: https://testnet.bscscan.com
- **Faucet**: https://testnet.binance.org/faucet-smart

### 已知的 BSC Testnet 合约
以下是一些常见的 BSC Testnet 合约地址（请验证最新地址）：

- **WBNB**: `0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd`
- **BUSD**: `0x8301F2213c0eeD49a7E28Ae4c3e91722919B8B47`
- **USDT**: 待确认
- **Multicall2**: 待确认

### Uniswap V3 部署
如果需要部署 Uniswap V3：
- [Uniswap V3 部署文档](https://docs.uniswap.org/contracts/v3/overview)
- [Uniswap V3 部署脚本](https://github.com/Uniswap/deploy-v3)

## 💡 推荐的开发方式

如果只是为了测试界面和钱包集成：
1. **当前状态已足够** - 界面可以正常加载，可以连接钱包
2. 交易功能会显示相应的错误或禁用状态

如果需要完整的交易功能：
1. 在 BSC Testnet 上寻找现有的 DEX（如 PancakeSwap V3）
2. 使用其合约地址配置本项目
3. 或者部署自己的 Uniswap V3 合约

## 🔍 常见问题

### Q: 为什么连接钱包后看不到代币？
A: 需要在 `src/constants/tokens.ts` 中配置 BSC Testnet 的代币列表。

### Q: 为什么不能进行交易？
A: 需要配置合约地址，见上述步骤 2。

### Q: 可以使用 PancakeSwap 的合约吗？
A: 理论上可以，但需要验证合约接口是否兼容 Uniswap V3。

### Q: 测试网 BNB 从哪里获取？
A: 访问 https://testnet.binance.org/faucet-smart 领取测试 BNB。

## 📝 更新日志

### 2025-10-30
- ✅ 添加 BSC Testnet 网络配置
- ✅ 修复 tokenMap 访问错误
- ✅ 添加区块浏览器支持
- ✅ 更新链 ID 验证逻辑
- ⚠️ 待配置：合约地址和代币列表
