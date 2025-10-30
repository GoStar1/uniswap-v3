#!/bin/bash

################################################################################
# Uniswap V3 部署到 BSC 测试网
################################################################################
# 使用方法:
#   1. 复制配置: cp .env.bsc-testnet.example .env.bsc-testnet
#   2. 编辑配置: 填入 PRIVATE_KEY 和 OWNER_ADDRESS
#   3. 运行部署: ./deploy-bsc-testnet.sh
################################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo ""
    echo "======================================"
    echo "  $1"
    echo "======================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 主标题
print_header "Uniswap V3 部署到 BSC 测试网"

# 1. 检查 .env 文件
print_info "检查配置文件..."
if [ ! -f .env.bsc-testnet ]; then
    print_error "配置文件不存在: .env.bsc-testnet"
    echo ""
    echo "请执行以下步骤："
    echo "  1. 复制配置模板: cp .env.bsc-testnet.example .env.bsc-testnet"
    echo "  2. 编辑配置文件: nano .env.bsc-testnet"
    echo "  3. 填入 PRIVATE_KEY 和 OWNER_ADDRESS"
    echo ""
    exit 1
fi

# 2. 加载环境变量
source .env.bsc-testnet

# 3. 验证必需参数
print_info "验证配置参数..."

VALIDATION_FAILED=0

if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "0x你的私钥" ]; then
    print_error "PRIVATE_KEY 未设置或仍是默认值"
    VALIDATION_FAILED=1
fi

if [ -z "$OWNER_ADDRESS" ] || [ "$OWNER_ADDRESS" = "0x你的所有者地址" ]; then
    print_error "OWNER_ADDRESS 未设置或仍是默认值"
    VALIDATION_FAILED=1
fi

if [ $VALIDATION_FAILED -eq 1 ]; then
    echo ""
    print_error "配置验证失败，请编辑 .env.bsc-testnet 文件并填入正确的值"
    exit 1
fi

print_success "配置验证通过"

# 4. 显示部署配置
echo ""
echo "📋 部署配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  RPC URL         : $JSON_RPC"
echo "  WBNB Address    : $WBNB_ADDRESS"
echo "  Native Currency : $NATIVE_CURRENCY_LABEL"
echo "  Owner Address   : $OWNER_ADDRESS"
echo "  V2 Factory      : ${V2_FACTORY_ADDRESS:-未设置}"
echo "  Gas Price       : ${GAS_PRICE:-默认} GWEI"
echo "  Confirmations   : ${CONFIRMATIONS:-2}"
echo "  State File      : ${STATE_FILE:-./state.json}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 5. 检查是否续传
if [ -f "${STATE_FILE:-./state.json}" ]; then
    print_warning "检测到已有部署状态文件: ${STATE_FILE:-./state.json}"
    echo "  部署将从上次中断处继续"
    echo "  如需重新部署，请先删除此文件: rm ${STATE_FILE:-./state.json}"
    echo ""
fi

# 6. 用户确认
read -p "确认开始部署？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "部署已取消"
    exit 0
fi

# 7. 开始部署
print_header "开始部署 Uniswap V3"

# 构建部署命令
CMD="npx ts-node index.ts"
CMD="$CMD --private-key $PRIVATE_KEY"
CMD="$CMD --json-rpc $JSON_RPC"
CMD="$CMD --weth9-address $WBNB_ADDRESS"
CMD="$CMD --native-currency-label $NATIVE_CURRENCY_LABEL"
CMD="$CMD --owner-address $OWNER_ADDRESS"

if [ -n "$V2_FACTORY_ADDRESS" ]; then
    CMD="$CMD --v2-core-factory-address $V2_FACTORY_ADDRESS"
fi

if [ -n "$GAS_PRICE" ]; then
    CMD="$CMD --gas-price $GAS_PRICE"
fi

if [ -n "$CONFIRMATIONS" ]; then
    CMD="$CMD --confirmations $CONFIRMATIONS"
fi

if [ -n "$STATE_FILE" ]; then
    CMD="$CMD --state $STATE_FILE"
fi

# 记录开始时间
START_TIME=$(date +%s)

# 执行部署
print_info "执行部署命令..."
echo ""

eval $CMD
DEPLOY_RESULT=$?

# 计算耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""

# 8. 检查部署结果
if [ $DEPLOY_RESULT -eq 0 ]; then
    print_header "部署成功完成！"

    print_success "所有合约已成功部署"
    print_info "总耗时: ${MINUTES} 分 ${SECONDS} 秒"
    echo ""

    echo "📄 部署详情"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  状态文件: ${STATE_FILE:-./state.json}"
    echo "  区块浏览器: https://testnet.bscscan.com"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # 显示部署的合约地址
    if [ -f "${STATE_FILE:-./state.json}" ]; then
        echo "📋 已部署的合约地址："
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        # 提取并格式化显示主要合约地址
        if command -v jq &> /dev/null; then
            # 如果有 jq，使用它来美化输出
            jq -r 'to_entries[] | select(.key | endswith("Address")) | "  \(.key | sub("Address$"; "")): \(.value)"' "${STATE_FILE:-./state.json}" 2>/dev/null || \
            cat "${STATE_FILE:-./state.json}"
        else
            # 否则使用 grep
            grep -o '"[^"]*Address"[[:space:]]*:[[:space:]]*"[^"]*"' "${STATE_FILE:-./state.json}" | \
            sed 's/"//g' | sed 's/Address:/: /' | sed 's/^/  /' || \
            cat "${STATE_FILE:-./state.json}"
        fi

        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi

    echo ""
    echo "🎉 下一步："
    echo "  1. 在 BSCScan 验证合约源码（可选）"
    echo "  2. 部署测试代币并创建交易对"
    echo "  3. 在前端界面中配置合约地址"
    echo ""

else
    print_header "部署失败"

    print_error "部署过程中出现错误"
    print_info "总耗时: ${MINUTES} 分 ${SECONDS} 秒"
    echo ""

    print_info "故障排除建议："
    echo "  1. 检查钱包是否有足够的测试 BNB"
    echo "  2. 检查 RPC 节点是否正常响应"
    echo "  3. 检查网络连接是否稳定"
    echo "  4. 查看上面的错误信息了解具体原因"
    echo ""

    print_warning "可以重新运行此脚本从上次中断处继续部署"
    echo "  命令: ./deploy-bsc-testnet.sh"
    echo ""

    exit 1
fi
