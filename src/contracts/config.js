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
    rpcUrls: ["https://eth-sepolia.public.blastapi.io"],
    blockExplorerUrls: ["https://sepolia.etherscan.io/"],
  },
};
