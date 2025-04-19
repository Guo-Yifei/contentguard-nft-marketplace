import React, { useState, useEffect } from "react";
import { Row, Col, Card, message, Spin, Button } from "antd";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";
import { LoadingOutlined } from "@ant-design/icons";

const NFTList = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { nftContract, marketContract, account, signer } = useWeb3();

  useEffect(() => {
    if (marketContract && nftContract) {
      loadMarketItems();
    }
  }, [marketContract, nftContract]);

  const loadMarketItems = async () => {
    try {
      setLoading(true);
      console.log("加载市场NFT列表...");

      const items = await marketContract.fetchActiveItems();
      console.log("获取到的活跃市场项数量:", items.length);

      const marketItems = await Promise.all(
        items.map(async (item) => {
          try {
            const tokenURI = await nftContract.tokenURI(item.tokenId);
            console.log(`Token ${item.tokenId} 的URI:`, tokenURI);

            let meta = {};
            try {
              if (tokenURI.startsWith("data:application/json;base64,")) {
                const base64Content = tokenURI.replace(
                  "data:application/json;base64,",
                  ""
                );
                const jsonString = atob(base64Content);
                meta = JSON.parse(jsonString);
              } else if (tokenURI.startsWith("http")) {
                const response = await fetch(tokenURI);
                meta = await response.json();
              } else {
                throw new Error("不支持的URI格式");
              }
            } catch (error) {
              console.error("解析元数据失败:", error);
              meta = {
                name: `NFT #${item.tokenId}`,
                description: "无法获取描述",
                image: "/placeholder.png",
              };
            }

            let imageUrl = meta.image || "/placeholder.png";
            if (!imageUrl.startsWith("http")) {
              imageUrl = "/placeholder.png";
            }

            const priceFormatted = ethers.formatUnits(
              item.price.toString(),
              "ether"
            );

            return {
              marketItemId: item.marketItemId.toString(),
              tokenId: item.tokenId.toString(),
              seller: item.seller,
              price: priceFormatted,
              priceWei: item.price,
              title: meta.name || `NFT #${item.tokenId}`,
              description: meta.description || "无描述",
              imageUrl: imageUrl,
              nftContract: item.nftContractAddress,
            };
          } catch (error) {
            console.error(`处理市场项 ${item.marketItemId} 失败:`, error);
            return null;
          }
        })
      );

      const validItems = marketItems.filter((item) => item !== null);
      console.log("处理后的市场项:", validItems);
      setNfts(validItems);
    } catch (error) {
      console.error("加载市场项目失败:", error);
      message.error("加载市场项目失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const buyNFT = async (nft) => {
    try {
      console.log("开始购买NFT...");
      console.log("市场项ID:", nft.marketItemId);
      console.log("NFT合约地址:", nft.nftContract);
      console.log("价格:", nft.price, "ETH");

      const hide = message.loading("处理购买交易...", 0);

      const tx = await marketContract.createMarketSale(
        nft.nftContract,
        nft.marketItemId,
        { value: nft.priceWei }
      );

      console.log("购买交易已提交，等待确认. 交易哈希:", tx.hash);
      message.info({
        content: (
          <div>
            <p>购买交易已提交，等待区块链确认...</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              在Etherscan上查看交易
            </a>
          </div>
        ),
        duration: 5,
      });

      const receipt = await tx.wait();
      console.log("购买交易已确认:", receipt);

      hide();

      message.success("NFT购买成功！");

      loadMarketItems();
    } catch (error) {
      console.error("购买NFT失败:", error);
      if (error.code === "ACTION_REJECTED") {
        message.error("您取消了交易");
      } else {
        message.error("购买NFT失败: " + error.message);
      }
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <div className="ml-4 text-xl">正在加载市场上的NFT...</div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">NFT 市场</h1>

      {nfts.length === 0 ? (
        <div className="text-center p-10 bg-gray-100 rounded-lg">
          <p className="text-xl mb-4">市场上目前没有NFT出售</p>
          <Link to="/create-nft">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              铸造新 NFT
            </button>
          </Link>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {nfts.map((nft) => (
            <Col key={nft.marketItemId} span={8}>
              <Card
                hoverable
                style={{
                  margin: "20px",
                  overflow: "hidden",
                }}
              >
                <div className="relative">
                  <div
                    className="relative overflow-hidden rounded-t-lg"
                    style={{ height: "240px" }}
                  >
                    <img
                      src={nft.imageUrl}
                      alt={nft.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                <div className="p-4">
                  <h2
                    className="text-lg font-semibold mb-2 truncate"
                    title={nft.title}
                  >
                    {nft.title}
                  </h2>
                  <p
                    className="text-sm text-gray-600 mb-2 line-clamp-2 h-10"
                    title={nft.description}
                  >
                    {nft.description}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Token ID: {nft.tokenId}
                  </p>
                  <p className="text-lg font-bold mb-4">
                    价格: {nft.price} ETH
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      卖家: {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
                    </span>
                    <Button
                      type="primary"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => buyNFT(nft)}
                      disabled={
                        !account ||
                        nft.seller.toLowerCase() === account.toLowerCase()
                      }
                    >
                      {nft.seller.toLowerCase() === account.toLowerCase()
                        ? "您的NFT"
                        : "购买"}
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="mt-8 flex justify-center">
        <Button type="default" size="large" onClick={loadMarketItems}>
          刷新列表
        </Button>
      </div>
    </div>
  );
};

export default NFTList;
