const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Marketplace", function () {
  let NFT;
  let nft;
  let Marketplace;
  let marketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // 获取合约工厂和测试账户
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署 Marketplace 合约
    Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();

    // 部署 NFT 合约，传入 marketplace 地址
    NFT = await ethers.getContractFactory("NFT");
    nft = await NFT.deploy(marketplaceAddress);
    await nft.waitForDeployment();
  });

  describe("Minting NFTs", function () {
    it("Should mint an NFT successfully", async function () {
      const tokenURI = "https://example.com/token/1";
      await nft.connect(addr1).mintToken(tokenURI);
      expect(await nft.ownerOf(1)).to.equal(addr1.address);
    });
  });

  describe("Marketplace Operations", function () {
    it("Should create a market item", async function () {
      const tokenURI = "https://example.com/token/1";
      await nft.connect(addr1).mintToken(tokenURI);
      // 添加更多测试...
    });
  });
});
