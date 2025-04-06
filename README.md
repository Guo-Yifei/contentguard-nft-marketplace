```markdown
# 🛡️ ContentGuard - Blockchain-Based Copyright Registry & NFT Marketplace

Welcome to **ContentGuard**, a decentralized NFT marketplace that enables creators to mint, buy, sell, and trade digital assets such as artwork, music, and collectibles—while maintaining full control and copyright over their creations.

This project is developed for the **CIS629 - Blockchain Technology and Applications** course at Syracuse University.
111

---

## 🌟 Key Features

- 🎨 Mint unique and verifiable NFTs linked to IPFS-stored digital content
- 🛒 Browse and purchase NFTs through a decentralized Web3 interface
- 👛 MetaMask wallet integration for authentication and transactions
- 🔐 Copyright registry and creator royalty enforcement via smart contracts
- 🧾 Transparent ownership history and marketplace interactions

---

## 🏗️ System Architecture Overview

ContentGuard is designed as a decentralized dApp consisting of:

- **Frontend (React.js)**: Enables user interaction with blockchain and IPFS
- **Smart Contracts (Solidity)**: Manage NFT logic, minting, ownership, and royalties
- **Blockchain Layer (Ethereum Testnet)**: Hosts and executes smart contracts
- **IPFS Storage (via infura/ipfs)**: Stores digital assets and metadata off-chain

---

## 🧰 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Ethers.js, React Router
- **Smart Contracts**: Solidity (ERC-721), Hardhat/Remix
- **Wallet Integration**: MetaMask
- **Storage**: IPFS via `ipfs-http-client`
- **Network**: Ethereum Testnet (e.g., Goerli or Sepolia)
- **Version Control**: Git & GitHub

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MetaMask browser extension
- Git

### Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/contentguard-nft-marketplace-frontend.git
cd contentguard-nft-marketplace-frontend
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`

---

## 📁 Project Structure

```
contentguard-nft-marketplace-frontend/
├── public/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route pages (Home, Mint, Marketplace, Assets, etc.)
│   ├── contracts/          # ABI files and contract interaction logic
│   ├── utils/              # Wallet, IPFS, or helper functions
│   └── App.js              # Main application entry
├── .gitignore
├── README.md
└── package.json
```

---

## 🧪 Modules (Planned / In Progress)

- [x] Wallet connection via MetaMask
- [x] Static UI for Minting NFTs
- [x] IPFS file upload testing
- [ ] Smart contract integration for minting & purchasing
- [ ] NFT marketplace with dynamic data
- [ ] My Assets & Ownership dashboard
- [ ] NFT detail page with royalty display
- [ ] Auction functionality (optional/extension)

---

## 🤝 Contributing

Contributions from all team members are welcomed!

To contribute:

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m "Added my feature"`
3. Push to GitHub: `git push origin feature/my-feature`
4. Submit a pull request (PR) for review

---

## 📷 Demo Screenshots

*Coming soon...*

---

## 📄 License

This project is licensed for educational use under the [MIT License](LICENSE).

---

## 👨‍💻 Authors

- **Yifei Guo** – Smart Contracts
- **Yi Ling** – Blockchain Integration & Testing
- **Yanghanyu Zhao** – Frontend Development (React, UI, Wallet)
- **Qingyuan Mao** – IPFS Integration & File Validation

---

## 💬 Feedback & Contact

For questions or collaboration, feel free to contact us through GitHub or via Syracuse University communication channels.

---
```

---


