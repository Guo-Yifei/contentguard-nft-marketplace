import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Card, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";

const MyAssets = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { nftContract, marketContract, account } = useWeb3();

  useEffect(() => {
    if (nftContract && account) {
      loadAllOwnedNFTs();
    }
  }, [nftContract, account]);

  const loadAllOwnedNFTs = async () => {
    try {
      setLoading(true);
      console.log("开始加载所有拥有的 NFT...");
      console.log("当前账户:", account);

      // 1. 使用 balanceOf 查询用户拥有的 NFT 数量
      const balance = await nftContract.balanceOf(account);
      console.log(`用户拥有 ${balance.toString()} 个 NFT`);

      if (balance.toString() === "0") {
        setNfts([]);
        setLoading(false);
        return;
      }

      // 2. 收集所有的 NFT
      const allOwnedNFTs = [];

      // 2.1 首先尝试使用 getTokensOwnedByMe() 方法
      try {
        console.log("尝试调用 getTokensOwnedByMe 方法");
        const tokensOfOwner = await nftContract.getTokensOwnedByMe();
        console.log("通过 getTokensOwnedByMe 获取的 token:", tokensOfOwner);

        for (let i = 0; i < tokensOfOwner.length; i++) {
          const tokenId = tokensOfOwner[i];
          // 获取并记录每个NFT的tokenURI
          const tokenURI = await nftContract.tokenURI(tokenId);
          console.log(`Token ID ${tokenId} 的URI: ${tokenURI}`);
          allOwnedNFTs.push({ tokenId, tokenURI });
        }
      } catch (error) {
        console.error("getTokensOwnedByMe 方法调用失败:", error);

        // 2.2 如果 getTokensOwnedByMe 不可用，手动查询所有可能的 tokenIds
        // 这是一个简化的实现，实际上需要更智能的方法来查询
        console.log("尝试手动遍历查询拥有的 NFT");
        try {
          // 搜索可能的 tokenId 范围，最多查询 100 个
          let foundCount = 0;
          for (let i = 1; i <= 100 && foundCount < balance; i++) {
            try {
              // 检查 token 是否存在并且是否归当前用户所有
              const owner = await nftContract.ownerOf(i);
              if (owner.toLowerCase() === account.toLowerCase()) {
                console.log(`找到用户拥有的 NFT: Token ID ${i}`);
                allOwnedNFTs.push({ tokenId: i });
                foundCount++;
              }
            } catch (error) {
              // 忽略不存在的 token ID
              if (!error.message.includes("nonexistent token")) {
                console.error(`检查 token ${i} 时出错:`, error);
              }
            }
          }
        } catch (error) {
          console.error("手动查询 NFT 失败:", error);
        }
      }

      console.log("找到的所有 NFT:", allOwnedNFTs);

      // 3. 获取每个 NFT 的元数据
      const items = await Promise.all(
        allOwnedNFTs.map(async (item) => {
          try {
            // 获取 NFT 的元数据 URI
            const tokenURI =
              item.tokenURI || (await nftContract.tokenURI(item.tokenId));
            console.log(`Token ID ${item.tokenId} 的 URI:`, tokenURI);

            // 获取元数据
            let meta = {};
            try {
              // 使用处理函数获取元数据
              const processedMeta = await processTokenURI(tokenURI);

              if (processedMeta) {
                meta = processedMeta;
                console.log("成功获取和处理元数据:", meta);
              } else {
                throw new Error("无法处理元数据");
              }
            } catch (error) {
              console.error(
                `获取 Token ID ${item.tokenId} 的元数据失败:`,
                error
              );
              meta = {
                name: `NFT #${item.tokenId.toString()}`,
                description: "无法获取描述",
                image: "/placeholder.png",
              };
            }

            // 尝试从市场合约中获取市场项信息
            let price = "未上市";
            let seller = ethers.ZeroAddress;
            let marketItemId = 0;

            try {
              // 使用辅助函数查找市场信息
              const marketItem = await findMarketItemForToken(item.tokenId);

              if (marketItem) {
                price = ethers.formatUnits(
                  marketItem.price.toString(),
                  "ether"
                );
                seller = marketItem.seller;
                marketItemId = marketItem.marketItemId.toNumber();
              }
            } catch (error) {
              console.error("获取市场信息失败:", error);
            }

            // 处理图片URL以确保显示
            const processImageUrl = (imageUrl) => {
              if (!imageUrl) return "/placeholder.png";

              // 确保URL是http开头的
              if (imageUrl.startsWith("http")) return imageUrl;

              // 如果是占位图像或其他类型，使用默认占位图
              return "/placeholder.png";
            };

            // 处理图片链接，确保有效
            let imageUrl = processImageUrl(meta.image);

            // 返回NFT数据对象
            return {
              id: marketItemId || item.tokenId.toString(),
              tokenId: item.tokenId.toString(),
              seller,
              owner: account,
              price,
              title: meta.name || `NFT #${item.tokenId.toString()}`,
              description: meta.description || "无描述",
              imageUrl,
              tokenURI: tokenURI,
              originalImage: meta.image, // 保存原始图片URL便于调试
              isListed: marketItemId > 0,
            };
          } catch (error) {
            console.error(`处理 Token ID ${item.tokenId} 时出错:`, error);
            return null;
          }
        })
      );

      // 过滤掉处理失败的 NFT
      const validNFTs = items.filter((item) => item !== null);
      console.log("处理后的 NFT 列表:", validNFTs);
      setNfts(validNFTs);
    } catch (error) {
      console.error("加载 NFT 失败:", error);
      message.error("加载 NFT 时发生错误: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 优化处理元数据的函数
  const processTokenURI = async (tokenURI) => {
    console.log("处理tokenURI:", tokenURI);

    try {
      // 处理base64编码的内联JSON
      if (tokenURI.startsWith("data:application/json;base64,")) {
        const base64Content = tokenURI.replace(
          "data:application/json;base64,",
          ""
        );
        const jsonString = atob(base64Content);
        console.log("解码的JSON字符串:", jsonString.substring(0, 100) + "...");
        return JSON.parse(jsonString);
      }

      // 简化外部URI处理
      if (tokenURI.startsWith("http")) {
        try {
          const response = await fetch(tokenURI, {
            cache: "no-cache",
            mode: "cors",
          });

          if (!response.ok) {
            throw new Error(`获取失败: ${response.status}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error("获取远程元数据失败:", error);
          throw error;
        }
      }

      // 创建一个默认的元数据对象
      return {
        name: `NFT #${Date.now()}`,
        description: "无法获取元数据",
        image: "/placeholder.png",
      };
    } catch (error) {
      console.error("处理元数据失败:", error);
      return {
        name: `NFT #${Date.now()}`,
        description: "元数据解析错误",
        image: "/placeholder.png",
      };
    }
  };

  // 查找NFT市场信息的辅助函数
  const findMarketItemForToken = async (tokenId) => {
    try {
      console.log(`查找Token ID ${tokenId}的市场信息`);

      const activeItems = await marketContract.fetchActiveItems();
      const nftAddress = await nftContract.getAddress();

      // 直接输出更多调试信息
      console.log("NFT合约地址:", nftAddress);
      console.log("活跃市场项数量:", activeItems.length);

      // 遍历所有活跃市场项目
      for (const item of activeItems) {
        // 确保可以正确打印数据
        const itemTokenId = item.tokenId.toString();
        const itemNftContract = item.nftContract.toLowerCase();

        console.log(`市场项: 合约=${itemNftContract}, TokenID=${itemTokenId}`);

        if (
          itemNftContract === nftAddress.toLowerCase() &&
          itemTokenId === tokenId.toString()
        ) {
          console.log(`找到匹配的市场项: ID=${item.marketItemId.toString()}`);
          return item;
        }
      }

      console.log(`未找到Token ID ${tokenId}的市场信息`);
      return null;
    } catch (error) {
      console.error("查询市场信息时出错:", error);
      return null;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <div className="ml-4 text-xl">正在加载您的 NFT...</div>
      </div>
    );

  if (nfts.length === 0)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">我的资产</h1>
        <div className="text-center p-10 bg-gray-100 rounded-lg">
          <p className="text-xl mb-4">您目前没有拥有任何 NFT</p>
          <Link to="/create-nft">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              铸造新 NFT
            </button>
          </Link>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">我的资产</h1>
      <Row gutter={[24, 24]}>
        {nfts.map((nft) => (
          <Col key={nft.id + "-" + nft.tokenId} span={8}>
            <Card
              hoverable
              style={{
                margin: "20px",
                overflow: "hidden",
              }}
            >
              <div className="relative" data-nft-id={nft.id}>
                <div
                  className="relative overflow-hidden rounded-t-lg"
                  style={{ height: "240px" }}
                >
                  <img
                    key={`${nft.tokenId}-${Date.now()}`}
                    src={nft.imageUrl || "/placeholder.png"}
                    alt={nft.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      console.error("图片加载失败:", e.target.src);
                      e.target.onerror = null; // 防止循环
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
                </div>

                <button
                  className="absolute top-2 right-2 bg-white text-black rounded-full p-2 shadow-lg opacity-70 hover:opacity-100 transition-opacity z-10"
                  title="刷新图片"
                  onClick={() => {
                    const img = document.querySelector(
                      `[data-nft-id="${nft.id}"] img`
                    );
                    if (img) {
                      const newSrc = nft.imageUrl.includes("?")
                        ? `${nft.imageUrl}&refresh=${Date.now()}`
                        : `${nft.imageUrl}?refresh=${Date.now()}`;
                      img.src = newSrc;
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
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
                <p className="text-sm text-gray-600 mb-3">
                  Token ID: {nft.tokenId}
                </p>

                <div className="mb-3">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-blue-500 hover:text-blue-700 font-medium">
                      查看元数据信息
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded-md text-xs overflow-auto max-h-24">
                      <p className="font-mono break-all">
                        <span className="font-bold">URI:</span>{" "}
                        {nft.tokenURI
                          ? nft.tokenURI.length > 60
                            ? nft.tokenURI.substring(0, 60) + "..."
                            : nft.tokenURI
                          : "N/A"}
                      </p>
                      <p className="font-mono break-all mt-1">
                        <span className="font-bold">图片:</span>{" "}
                        {nft.originalImage
                          ? nft.originalImage.length > 60
                            ? nft.originalImage.substring(0, 60) + "..."
                            : nft.originalImage
                          : "N/A"}
                      </p>
                    </div>
                  </details>
                </div>

                {nft.isListed ? (
                  <p className="text-lg font-bold mb-2">
                    价格: {nft.price} ETH
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm flex-1"
                      onClick={() => navigate(`/list-nft/${nft.tokenId}`)}
                    >
                      上架出售
                    </button>

                    <button
                      className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300 text-sm flex-1"
                      onClick={async () => {
                        const contractAddress = await nftContract.getAddress();
                        window.open(
                          `https://sepolia.etherscan.io/token/${contractAddress}?a=${nft.tokenId}`,
                          "_blank"
                        );
                      }}
                    >
                      查看详情
                    </button>

                    <div className="w-full flex gap-2 mt-2">
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 text-sm flex-1"
                        onClick={() => {
                          window.open(nft.tokenURI, "_blank");
                        }}
                      >
                        查看元数据
                      </button>

                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm flex-1"
                        onClick={async () => {
                          // 确认是否真的要删除
                          const confirmed = window.confirm(
                            `确定要删除NFT #${nft.tokenId}吗？此操作不可逆，NFT将被转移到一个烧毁地址。`
                          );
                          if (!confirmed) return;

                          try {
                            // 显示加载中消息
                            message.loading("正在处理，请勿关闭页面...", 0);

                            // 将NFT转移到烧毁地址
                            const burnAddress =
                              "0x000000000000000000000000000000000000dEaD";
                            const tx = await nftContract[
                              "safeTransferFrom(address,address,uint256)"
                            ](account, burnAddress, nft.tokenId);

                            // 等待交易确认
                            await tx.wait();

                            // 关闭加载消息并显示成功消息
                            message.destroy();
                            message.success(`NFT #${nft.tokenId} 已成功删除！`);

                            // 刷新NFT列表
                            loadAllOwnedNFTs();
                          } catch (error) {
                            // 处理错误
                            message.destroy();
                            console.error("删除NFT时出错:", error);
                            message.error(`删除NFT失败: ${error.message}`);
                          }
                        }}
                      >
                        删除此NFT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default MyAssets;
