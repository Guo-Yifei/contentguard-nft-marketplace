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
MARKETPLACE_CONTRACT_ADDRESS_SEPOLIA=0x29a0D29AF3139b033F03d097837BF7Cb3B55E154
NFT_CONTRACT_ADDRESS_SEPOLIA=0xa487193DAa57808773Ec35F1EdB3E49d26195B1A
```

## 2. 合约部署流程（仅在需要修改合约时）

### 2.1 修改合约注意事项

⚠️ **重要提醒：修改智能合约将导致以下连锁反应**

1. **需要重新部署的情况**：

   - 修改任何合约功能
   - 修改合约状态变量
   - 修改事件定义
   - 修改函数参数或返回值

2. **对前端的影响**：

   - 新的合约地址
   - 新的 ABI
   - 可能需要修改前端调用逻辑

3. **对用户的影响**：
   - 旧合约数据将无法迁移
   - 用户需要重新授权新合约
   - NFT 和市场数据需要重新创建

### 2.2 部署步骤

1. **编译合约**

```bash
npx hardhat compile
```

2. **部署到 Sepolia 测试网**

```bash
npx hardhat run scripts/deploy.cjs --network sepolia
```

3. **验证合约**

```bash
# 验证 Marketplace 合约
npx hardhat verify --network sepolia MARKETPLACE_CONTRACT_ADDRESS

# 验证 NFT 合约（需要传入 Marketplace 地址作为参数）
npx hardhat verify --network sepolia NFT_CONTRACT_ADDRESS MARKETPLACE_CONTRACT_ADDRESS
```

### 2.3 部署后的必要操作

1. **更新配置文件**

   - 在 `src/contracts/config.js` 中更新合约地址
   - 运行 `npm run sync-abi` 更新 ABI 文件

2. **通知相关方**

   - 通知前端开发人员新的合约地址和 ABI
   - 通知用户需要重新授权和迁移数据
   - 更新文档中的合约地址

3. **验证部署**
   - 在 Etherscan 上验证合约代码
   - 测试新合约的所有功能
   - 确保前端能正确调用新合约

## 3. 前端开发配置

1. **获取合约 ABI**
   运行以下命令将合约 ABI 同步到前端目录：

```bash
npm run sync-abi
```

这将在 `src/contracts/` 目录下生成：

- `NFT.json`：NFT 合约的 ABI
- `Marketplace.json`：Marketplace 合约的 ABI

2. **合约配置文件**
   在 `src/contracts/config.js` 中已包含了必要的配置：

```javascript
export const CONTRACT_ADDRESSES = {
  sepolia: {
    marketplace: "0x29a0D29AF3139b033F03d097837BF7Cb3B55E154",
    nft: "0xa487193DAa57808773Ec35F1EdB3E49d26195B1A",
  },
};

export const NETWORK_CONFIG = {
  sepolia: {
    chainId: "0xaa36a7", // 11155111 in hex
    chainName: "Sepolia Testnet",
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "SEP",
      decimals: 18,
    },
    rpcUrls: ["https://sepolia.infura.io/v3/"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
};
```

3. **前端调用示例**

```javascript
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../contracts/config.js";
import NFT_ABI from "../contracts/NFT.json";
import MARKETPLACE_ABI from "../contracts/Marketplace.json";

// 初始化合约
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const nftContract = new ethers.Contract(
  CONTRACT_ADDRESSES.sepolia.nft,
  NFT_ABI.abi,
  signer
);

const marketplaceContract = new ethers.Contract(
  CONTRACT_ADDRESSES.sepolia.marketplace,
  MARKETPLACE_ABI.abi,
  signer
);

// 调用示例
async function mintNFT(tokenURI) {
  const tx = await nftContract.mintToken(tokenURI);
  await tx.wait();
  return tx;
}

async function createMarketItem(tokenId, price) {
  const listingFee = await marketplaceContract.getListingFee();
  const tx = await marketplaceContract.createMarketItem(
    CONTRACT_ADDRESSES.sepolia.nft,
    tokenId,
    ethers.utils.parseEther(price),
    { value: listingFee }
  );
  await tx.wait();
  return tx;
}
```

## 4. 合约功能说明

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
   - 返回：新铸造的 NFT ID
   - 事件：`TokenMinted(uint256 tokenId, string tokenURI, address marketplaceAddress)`

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

1. `createMarketItem(address nftContractAddress, uint256 tokenId, uint256 price)`: 创建市场销售项目

   - 参数：
     - nftContractAddress: NFT 合约地址
     - tokenId: NFT ID
     - price: 售价（以 Wei 为单位）
   - 需要支付 0.001 ETH 的上市费用
   - 事件：`MarketItemCreated`

2. `createMarketSale(address nftContractAddress, uint256 marketItemId)`: 购买 NFT

   - 参数：
     - nftContractAddress: NFT 合约地址
     - marketItemId: 市场项目 ID
   - 需要支付标价的 ETH

3. `cancelMarketItem(address nftContractAddress, uint256 marketItemId)`: 取消市场项目
   - 只有卖家可以取消
   - NFT 会返回给卖家

## 5. 前端开发注意事项

1. **MetaMask 配置**
   - 确保用户已安装 MetaMask
   - 添加 Sepolia 测试网络
   - 检查用户是否有足够的测试币

```javascript
// 检查 MetaMask 是否已安装
if (typeof window.ethereum === "undefined") {
  throw new Error("请安装 MetaMask!");
}

// 请求连接钱包
await window.ethereum.request({ method: "eth_requestAccounts" });

// 切换到 Sepolia 网络
await window.ethereum.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0xaa36a7" }], // Sepolia chainId
});
```

2. **错误处理**
   - 处理用户拒绝交易的情况
   - 处理网络切换失败
   - 处理合约调用失败

```javascript
try {
  await marketplaceContract.createMarketSale(nftAddress, itemId, {
    value: price,
  });
} catch (error) {
  if (error.code === 4001) {
    console.log("用户拒绝了交易");
  } else if (error.code === -32603) {
    console.log("交易失败，可能是金额不足");
  }
  throw error;
}
```

3. **事件监听**
   - 监听 NFT 铸造事件
   - 监听市场项目创建事件
   - 监听交易完成事件

```javascript
// 监听 NFT 铸造事件
nftContract.on("TokenMinted", (tokenId, tokenURI, marketplaceAddress) => {
  console.log(`新 NFT 铸造成功：${tokenId}`);
});

// 监听市场项目创建事件
marketplaceContract.on(
  "MarketItemCreated",
  (itemId, nftContract, tokenId, creator, seller, owner, price) => {
    console.log(`新市场项目创建：${itemId}`);
  }
);
```

4. **获取测试币**
   - Sepolia 测试网 ETH 水龙头：[Sepolia Faucet](https://sepoliafaucet.com)
   - Alchemy 水龙头：[Alchemy Faucet](https://sepoliafaucet.com)
   - 每天可以领取少量测试币

## 6. 常见问题解决

1. **合约调用失败**

   - 检查用户钱包余额
   - 确认是否在正确的网络
   - 验证交易参数是否正确

2. **Gas 费用问题**

   - 上市费用固定为 0.001 ETH
   - 交易 Gas 费用由网络拥堵程度决定
   - 建议使用 `ethers.utils.parseUnits` 处理金额

3. **MetaMask 相关**
   - 确保 MetaMask 已解锁
   - 检查网络连接状态
   - 处理账户切换事件

```javascript
// 监听账户变化
window.ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    console.log("请连接 MetaMask");
  } else {
    console.log("当前账户：", accounts[0]);
  }
});

// 监听网络变化
window.ethereum.on("chainChanged", (chainId) => {
  window.location.reload();
});
```

## 7. 合约升级检查清单

在决定升级合约之前，请检查以下事项：

1. **必要性评估**

   - 修改是否真的必要？
   - 是否有其他解决方案？
   - 对用户影响的评估

2. **风险评估**

   - 数据迁移方案
   - 用户体验影响
   - 潜在的安全风险

3. **协作沟通**

   - 与前端团队确认修改影响
   - 与产品团队确认功能变更
   - 准备用户通知方案

4. **测试要求**

   - 完整的单元测试
   - 前端集成测试
   - 用户操作流程测试

5. **文档更新**

   - 更新技术文档
   - 更新用户指南
   - 更新 API 文档

6. **部署计划**
   - 选择合适的部署时间
   - 准备回滚方案
   - 制定监控计划

## 8. 当前部署信息

**合约地址（Sepolia 测试网）：**

- Marketplace: `0x29a0D29AF3139b033F03d097837BF7Cb3B55E154`
- NFT: `0xa487193DAa57808773Ec35F1EdB3E49d26195B1A`

**验证状态：**

- 合约已在 Etherscan 上验证
- 可直接在 Etherscan 上查看代码和交互

**相关链接：**

- [Marketplace Contract on Etherscan](https://sepolia.etherscan.io/address/0x29a0D29AF3139b033F03d097837BF7Cb3B55E154)
- [NFT Contract on Etherscan](https://sepolia.etherscan.io/address/0xa487193DAa57808773Ec35F1EdB3E49d26195B1A)
