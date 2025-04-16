<<<<<<< HEAD
# 🛡️ ContentGuard - Blockchain-Based Copyright Registry & NFT Marketplace

Welcome to ContentGuard, a decentralized NFT marketplace that enables creators to mint, buy, sell, and trade digital assets such as artwork, music, and collectibles—while maintaining full control and copyright over their creations.

This project is developed for the CIS629 - Blockchain Technology and Applications course at Syracuse University.

## 🌟 Key Features

- 🎨 Mint unique and verifiable NFTs linked to IPFS-stored digital content
- 🛒 Browse and purchase NFTs through a decentralized Web3 interface
- 👛 MetaMask wallet integration for authentication and transactions
- 🔐 Copyright registry and creator royalty enforcement via smart contracts
- 🧾 Transparent ownership history and marketplace interactions

## 🏗️ System Architecture Overview

ContentGuard is designed as a decentralized dApp consisting of:

- Frontend (React.js): Enables user interaction with blockchain and IPFS
- Smart Contracts (Solidity): Manage NFT logic, minting, ownership, and royalties
- Blockchain Layer (Sepolia Testnet): Hosts and executes smart contracts
- IPFS Storage: Stores digital assets and metadata off-chain
=======
# ContentGuard NFT Marketplace

This project contains:
- Solidity smart contracts (`NFT.sol`, `marketplace.sol`)
- React frontend (Vite + ethers.js)

---

## Prerequisites

- **Node.js v18** (recommended, use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- **MetaMask** browser extension
- **Git**
>>>>>>> origin/Linyi

## 🔗 Deployed Contracts (Sepolia Testnet)

- **Marketplace Contract**: [`0x29a0D29AF3139b033F03d097837BF7Cb3B55E154`](https://sepolia.etherscan.io/address/0x29a0D29AF3139b033F03d097837BF7Cb3B55E154)
- **NFT Contract**: [`0xa487193DAa57808773Ec35F1EdB3E49d26195B1A`](https://sepolia.etherscan.io/address/0xa487193DAa57808773Ec35F1EdB3E49d26195B1A)

<<<<<<< HEAD
## 🧰 Tech Stack

- Frontend: React.js, Tailwind CSS, Ethers.js, React Router
- Smart Contracts: Solidity (ERC-721), Hardhat
- Wallet Integration: MetaMask
- Storage: IPFS
- Network: Ethereum Sepolia Testnet
- Version Control: Git & GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MetaMask browser extension
- Git
- Sepolia testnet ETH (from [Sepolia Faucet](https://sepoliafaucet.com))

### Installation

1. Clone the Repository

```bash
git clone https://github.com/Guo-Yifei/contentguard-nft-marketplace.git
cd contentguard-nft-marketplace
```

2. Install Dependencies
=======
## 1. Install Dependencies
>>>>>>> origin/Linyi

```bash
npm install
```

<<<<<<< HEAD
3. Configure Environment
   Copy `.env.example` to `.env` and fill in your credentials:

```env
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

4. Start the Development Server
=======
---

## 2. Compile Smart Contracts

```bash
npx hardhat clean
npx hardhat compile
```

---

## 3. Deploy Contracts

### a) Deploy to Local Hardhat Network

1. **Start local node** (in a new terminal):
   ```npx hardhat node
   ```
2. **Deploy contracts** (in another terminal):
   ```npx hardhat run scripts/deploy.cjs --network localhost
   ```

### b) Deploy to Sepolia Testnet

1. In `hardhat.config.cjs`, set your Sepolia RPC and private key:
   ```js
   networks: {
     sepolia: {
       url: "https://eth-sepolia.public.blastapi.io",
       accounts: ["YOUR_PRIVATE_KEY"]
     }
   }
   ```
2. **Deploy:**
   ```
   npx hardhat run scripts/deploy.cjs --network sepolia
   ```
3. **Note the deployed contract addresses** for frontend use.

---

## 4. Configure Frontend

In `src/components/ContractInteraction.jsx`, update the contract addresses:

```js
const MARKETPLACE_ADDRESS = "your_marketplace_contract_address";
const NFT_ADDRESS = "your_nft_contract_address";
```

---

## 5. Run the Frontend
>>>>>>> origin/Linyi

```bash
npm run dev
```

<<<<<<< HEAD
Visit `http://localhost:5173/` in your browser.
=======
Open your browser and go to [http://localhost:5173](http://localhost:5173)

---
>>>>>>> origin/Linyi

## 6. Common Issues

<<<<<<< HEAD
```
contentguard-nft-marketplace/
├── contracts/             # Solidity smart contracts
│   ├── NFT.sol           # ERC721 NFT contract
│   └── marketplace.sol    # NFT marketplace contract
├── scripts/              # Deployment and utility scripts
├── test/                 # Contract test files
├── src/
│   ├── components/       # React components
│   ├── contracts/        # Contract ABIs and addresses
│   ├── pages/           # Route pages
│   └── utils/           # Helper functions
├── hardhat.config.cjs    # Hardhat configuration
└── package.json
```
=======
- **JSX Syntax Error:**  
  Make sure your React component files use the `.jsx` extension (e.g., `App.jsx`).

- **MetaMask Connection:**  
  Ensure MetaMask is on the same network as your contracts (localhost or Sepolia).

- **Missing Dependencies:**  
  If you see errors about `@openzeppelin/contracts`, run:
  ```bash
  npm install @openzeppelin/contracts
  ```
>>>>>>> origin/Linyi

## 🔄 Contract Interaction

<<<<<<< HEAD
### Key Functions

1. **NFT Contract**
=======
## 7. Get Sepolia Test ETH

- [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
>>>>>>> origin/Linyi

   - `mintToken(tokenURI)`: Mint new NFT
   - `getTokensOwnedByMe()`: List owned NFTs
   - `getTokensCreatedByMe()`: List created NFTs

2. **Marketplace Contract**
   - `createMarketItem(nftContract, tokenId, price)`: List NFT for sale
   - `createMarketSale(nftContract, itemId)`: Purchase NFT
   - `fetchAvailableMarketItems()`: Get available NFTs
   - `fetchOwnedMarketItems()`: Get owned NFTs

### Listing Fee

- Fixed fee: 0.001 ETH for listing items
- Paid by seller when creating market items

## 🧪 Development Status

- [x] Smart contract development and deployment
- [x] Contract verification on Etherscan
- [x] Frontend basic structure
- [x] MetaMask integration
- [ ] NFT minting interface
- [ ] Marketplace listing and trading
- [ ] User dashboard
- [ ] IPFS integration

<<<<<<< HEAD
## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Submit a pull request

## 👥 Team

- **Yifei Guo** – Smart Contracts & Blockchain Integration
- **Yi Ling** – Testing & Quality Assurance
- **Yanghanyu Zhao** – Frontend Development
- **Qingyuan Mao** – IPFS Integration

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Contact

For questions or feedback, please reach out through:

- GitHub Issues
- Syracuse University channels
```

---
=======
If you have any questions, feel free to open an issue!
>>>>>>> origin/Linyi


```

