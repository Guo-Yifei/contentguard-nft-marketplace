# ContentGuard NFT Marketplace

This project contains:
- Solidity smart contracts (`NFT.sol`, `marketplace.sol`)
- React frontend (Vite + ethers.js)

---

## Prerequisites

- **Node.js v18** (recommended, use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- **MetaMask** browser extension
- **Git**

---

## 1. Install Dependencies

```bash
npm install
```

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
   ```bash
   npx hardhat node
   ```
2. **Deploy contracts** (in another terminal):
   ```bash
   npx hardhat run scripts/deploy.cjs --network localhost
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
   ```bash
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

```bash
npm run dev
```

Open your browser and go to [http://localhost:5173](http://localhost:5173)

---

## 6. Common Issues

- **JSX Syntax Error:**  
  Make sure your React component files use the `.jsx` extension (e.g., `App.jsx`).

- **MetaMask Connection:**  
  Ensure MetaMask is on the same network as your contracts (localhost or Sepolia).

- **Missing Dependencies:**  
  If you see errors about `@openzeppelin/contracts`, run:
  ```bash
  npm install @openzeppelin/contracts
  ```

---

## 7. Get Sepolia Test ETH

- [https://sepoliafaucet.com/](https://sepoliafaucet.com/)

---

If you have any questions, feel free to open an issue!


