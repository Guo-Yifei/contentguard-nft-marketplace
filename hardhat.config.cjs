require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  },
  networks: {
    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
      accounts: ["d1b61afc33190450cb13b17d11d21cc72160fd5d4ce43eb6710240024be0b2d2"],
      timeout: 60000,
      gasPrice: 3000000000,
      confirmations: 2,
      networkId: 11155111
    }
  },
  paths: {
    artifacts: "./src/artifacts",
  }
}; 