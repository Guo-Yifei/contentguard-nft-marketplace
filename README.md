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

## 🔗 Deployed Contracts (Sepolia Testnet)

- **Marketplace Contract**: [`0x29a0D29AF3139b033F03d097837BF7Cb3B55E154`](https://sepolia.etherscan.io/address/0x29a0D29AF3139b033F03d097837BF7Cb3B55E154)
- **NFT Contract**: [`0xa487193DAa57808773Ec35F1EdB3E49d26195B1A`](https://sepolia.etherscan.io/address/0xa487193DAa57808773Ec35F1EdB3E49d26195B1A)

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

```bash
npm install
```

3. Configure Environment
   Copy `.env.example` to `.env` and fill in your credentials:

```env
SEPOLIA_RPC_URL=your_alchemy_or_infura_url
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

4. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173/` in your browser.

## 📁 Project Structure

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

## 🔄 Contract Interaction

### Key Functions

1. **NFT Contract**

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


```
