# ContentGuard NFT Marketplace 部署指南

## 1. 环境准备

1. **安装依赖**

```bash
npm install
```

2. **配置环境变量**
   创建 `.env` 文件并填入以下内容：

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private Keys
PRIVATE_KEY=YOUR_WALLET_PRIVATE_KEY

# API Keys
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Contract Addresses (will be filled by deploy script)
MARKETPLACE_CONTRACT_ADDRESS_SEPOLIA=
NFT_CONTRACT_ADDRESS_SEPOLIA=
```

## 2. 部署合约

1. **部署到 Sepolia 测试网**

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

2. **验证合约**
   等待几分钟让合约同步到区块链后，运行：

```bash
# 验证 Marketplace 合约
npx hardhat verify --network sepolia MARKETPLACE_CONTRACT_ADDRESS

# 验证 NFT 合约（需要传入 Marketplace 地址作为参数）
npx hardhat verify --network sepolia NFT_CONTRACT_ADDRESS MARKETPLACE_CONTRACT_ADDRESS
```

## 3. 合约功能说明

### NFT 合约功能

#### Read 函数

1. `balanceOf(address owner)`: 查询地址拥有的 NFT 数量
2. `getTokenCreatorById(uint256 tokenId)`: 查询 NFT 创建者
3. `getTokensCreatedByMe()`: 查询当前地址创建的所有 NFT
4. `getTokensOwnedByMe()`: 查询当前地址拥有的所有 NFT
5. `ownerOf(uint256 tokenId)`: 查询 NFT 的当前所有者

#### Write 函数

1. `mintToken(string memory tokenURI)`: 铸造新的 NFT

   - 参数：IPFS 元数据链接
   - 示例：`https://console.filebase.com/object/items/jack.json`

2. `setApprovalForAll(address operator, bool approved)`: 授权市场合约操作 NFT
   - operator: Marketplace 合约地址
   - approved: true

### Marketplace 合约功能

#### Read 函数

1. `getListingFee()`: 查询上市费用（0.001 ETH）
2. `getOwner()`: 查询合约所有者
3. `fetchAvailableMarketItems()`: 查询所有可购买的 NFT
4. `fetchSellingMarketItems()`: 查询当前地址正在出售的 NFT
5. `fetchOwnedMarketItems()`: 查询当前地址拥有的市场项目
6. `getLatestMarketItemByTokenId(uint256 tokenId)`: 查询特定 NFT 的最新市场状态

#### Write 函数

1. `setOwner(address payable newOwner)`: 设置新的合约所有者

   - 只有当前所有者可以调用
   - 参数：新所有者地址

2. `createMarketItem(address nftContractAddress, uint256 tokenId, uint256 price)`: 创建市场销售项目

   - nftContractAddress: NFT 合约地址
   - tokenId: NFT ID
   - price: 售价（以 Wei 为单位）
   - 需要支付 0.001 ETH 的上市费用

3. `createMarketSale(address nftContractAddress, uint256 marketItemId)`: 购买 NFT

   - nftContractAddress: NFT 合约地址
   - marketItemId: 市场项目 ID
   - 需要支付标价的 ETH

4. `cancelMarketItem(address nftContractAddress, uint256 marketItemId)`: 取消市场项目
   - 只有卖家可以取消
   - NFT 会返回给卖家

## 4. 测试流程

1. **铸造 NFT**

   - 准备 IPFS 元数据
   - 调用 NFT 合约的 `mintToken` 函数
   - 等待交易确认

2. **授权市场合约**

   - 调用 NFT 合约的 `setApprovalForAll`
   - operator 填入 Marketplace 地址
   - approved 设为 true

3. **创建市场项目**

   - 调用 Marketplace 合约的 `createMarketItem`
   - 设置价格
   - 支付 0.001 ETH 上市费用

4. **购买 NFT**
   - 使用另一个账户
   - 调用 `createMarketSale`
   - 支付标价金额

## 5. 常见问题

1. **上市费用说明**

   - 费用金额：0.001 ETH
   - 支付给合约所有者
   - 可以通过 `setOwner` 更改接收地址

2. **合约验证失败**

   - 等待几分钟让合约同步到区块链
   - 确保 Etherscan API key 正确
   - 使用完整的合约地址

3. **MetaMask 操作**
   - 确保连接到 Sepolia 测试网
   - 确保有足够的测试网 ETH
   - 可以从水龙头获取测试币：[Sepolia Faucet](https://sepoliafaucet.com)
