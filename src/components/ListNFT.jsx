import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, InputNumber, Button, message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useWeb3 } from "../context/Web3Context";
import { ethers } from "ethers";

const ListNFT = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { nftContract, marketContract, account } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [nftData, setNftData] = useState(null);

  useEffect(() => {
    if (nftContract && account && tokenId) {
      loadNFTData();
    }
  }, [nftContract, account, tokenId]);

  const loadNFTData = async () => {
    try {
      setInitialLoading(true);
      console.log(`加载 Token ID ${tokenId} 的数据`);

      // 检查 NFT 所有者
      const owner = await nftContract.ownerOf(tokenId);
      console.log(`Token ID ${tokenId} 的所有者: ${owner}`);

      if (owner.toLowerCase() !== account.toLowerCase()) {
        message.error("您不是这个 NFT 的所有者");
        navigate("/my-assets");
        return;
      }

      // 获取 NFT 元数据
      try {
        // 获取 NFT 的元数据 URI
        const tokenURI = await nftContract.tokenURI(tokenId);
        console.log(`Token ID ${tokenId} 的 URI:`, tokenURI);

        // 处理元数据
        let meta = {};
        try {
          // 处理base64编码的内联JSON
          if (tokenURI.startsWith("data:application/json;base64,")) {
            const base64Content = tokenURI.replace(
              "data:application/json;base64,",
              ""
            );
            const jsonString = atob(base64Content);
            meta = JSON.parse(jsonString);
            console.log("成功解析base64编码的元数据");
          }
          // 处理HTTP URI
          else if (tokenURI.startsWith("http")) {
            const response = await fetch(tokenURI, {
              cache: "no-cache",
              mode: "cors",
            });
            meta = await response.json();
            console.log("成功获取远程元数据");
          } else {
            throw new Error("不支持的URI格式");
          }
        } catch (error) {
          console.error(`解析元数据失败:`, error);
          meta = {
            name: `NFT #${tokenId}`,
            description: "无法获取描述",
            image: "/placeholder.png",
          };
        }

        // 处理图片URL
        let imageUrl = meta.image || "/placeholder.png";
        if (!imageUrl.startsWith("http")) {
          imageUrl = "/placeholder.png";
        }

        setNftData({
          tokenId,
          title: meta.name || `NFT #${tokenId}`,
          description: meta.description || "无描述",
          imageUrl: imageUrl,
        });
      } catch (error) {
        console.error(`处理 Token ID ${tokenId} 时出错:`, error);
        message.error("加载 NFT 数据失败，请重试");
        navigate("/my-assets");
        return;
      }
    } catch (error) {
      console.error("加载 NFT 数据失败:", error);
      message.error("加载 NFT 数据失败: " + error.message);
      navigate("/my-assets");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleListNFT = async (values) => {
    try {
      setLoading(true);
      console.log("正在将 NFT 上架到市场...");
      console.log("上架价格:", values.price, "ETH");

      // 显示整体进度消息
      const hide = message.loading("处理上架交易...", 0);

      try {
        // 获取上架费用
        const listingFee = await marketContract.getListingFee();
        console.log("上架费用:", ethers.formatEther(listingFee), "ETH");

        // 将价格从 ETH 转换为 Wei
        const priceInWei = ethers.parseEther(values.price.toString());

        // 授权市场合约管理此 NFT
        console.log("授权市场合约管理 NFT...");
        const marketplaceAddress = await marketContract.getAddress();
        console.log("市场合约地址:", marketplaceAddress);

        // 检查是否已经授权
        const isApproved = await nftContract.isApprovedForAll(
          account,
          marketplaceAddress
        );
        const approved = await nftContract.getApproved(tokenId);

        let approveTx;
        if (
          !isApproved &&
          approved.toLowerCase() !== marketplaceAddress.toLowerCase()
        ) {
          console.log("需要授权，发送授权交易...");
          approveTx = await nftContract.approve(marketplaceAddress, tokenId);
          console.log("授权交易哈希:", approveTx.hash);

          message.info({
            content: (
              <div>
                <p>授权交易已提交，等待确认...</p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${approveTx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  在 Etherscan 上查看
                </a>
              </div>
            ),
            duration: 5,
          });

          // 等待授权交易确认
          await approveTx.wait();
          console.log("授权成功");
        } else {
          console.log("NFT已经被授权，无需再次授权");
        }

        // 创建市场项目
        console.log("创建市场项目...");
        console.log("NFT合约地址:", await nftContract.getAddress());
        console.log("Token ID:", tokenId);
        console.log("价格Wei:", priceInWei.toString());
        console.log("上架费用Wei:", listingFee.toString());

        const tx = await marketContract.createMarketItem(
          await nftContract.getAddress(),
          tokenId,
          priceInWei,
          { value: listingFee }
        );

        console.log("创建市场项目交易哈希:", tx.hash);

        message.info({
          content: (
            <div>
              <p>上架交易已提交，等待确认...</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                在 Etherscan 上查看
              </a>
            </div>
          ),
          duration: 5,
        });

        // 等待交易确认
        const receipt = await tx.wait();
        console.log("NFT 已成功上架到市场");

        // 关闭整体进度消息
        hide();

        // 显示成功消息
        message.success("NFT 已成功上架到市场！");

        // 延迟返回我的资产页面
        setTimeout(() => {
          navigate("/my-assets");
        }, 2000);
      } catch (error) {
        // 关闭整体进度消息
        hide();
        throw error;
      }
    } catch (error) {
      console.error("上架 NFT 失败:", error);
      if (error.code === "ACTION_REJECTED") {
        message.error("您取消了交易");
      } else {
        message.error("上架 NFT 失败: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
        <div className="ml-4 text-xl">正在加载 NFT 数据...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">上架 NFT</h1>

      {nftData && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <img
                src={nftData.imageUrl}
                alt={nftData.title}
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.png";
                }}
              />
            </div>
            <div className="md:w-2/3 md:pl-6">
              <h2 className="text-xl font-bold mb-2">{nftData.title}</h2>
              <p className="text-gray-600 mb-2">{nftData.description}</p>
              <p className="text-sm text-gray-500">
                Token ID: {nftData.tokenId}
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleListNFT}
                initialValues={{ price: 0.01 }}
                className="mt-6"
              >
                <Form.Item
                  label="售价 (ETH)"
                  name="price"
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 0.001,
                      message: "价格必须大于 0.001 ETH",
                    },
                  ]}
                >
                  <InputNumber
                    min={0.001}
                    step={0.001}
                    style={{ width: "100%" }}
                    placeholder="输入您想要的售价"
                  />
                </Form.Item>

                <div className="flex space-x-4 mt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "上架中..." : "上架到市场"}
                  </Button>

                  <Button
                    onClick={() => navigate("/my-assets")}
                    className="border-gray-300"
                  >
                    取消
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
        <p className="mb-2">上架须知:</p>
        <ul className="list-disc pl-5">
          <li>上架 NFT 需要支付小额上架费用</li>
          <li>上架后，任何人都可以查看并购买您的 NFT</li>
          <li>NFT 成功出售后，您将收到售价扣除平台费用后的金额</li>
        </ul>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <p className="mt-3">正在处理您的上架请求，请稍候...</p>
            <p className="text-sm text-gray-500 mt-2">
              这可能需要一些时间，请不要关闭此页面
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListNFT;
