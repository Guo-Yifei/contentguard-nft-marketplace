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
      const nftAddress = await nft.getAddress();

      // 获取上市费用
      const listingFee = await marketplace.getListingFee();

      // 设置 NFT 售价
      const price = ethers.parseEther("1");

      // addr1 创建市场项目
      await marketplace.connect(addr1).createMarketItem(nftAddress, 1, price, {
        value: listingFee,
      });

      // 验证市场项目已创建
      const items = await marketplace.fetchAvailableMarketItems();
      expect(items.length).to.equal(1);
      expect(items[0].price).to.equal(price);
      expect(items[0].seller).to.equal(addr1.address);
    });
  });
});
