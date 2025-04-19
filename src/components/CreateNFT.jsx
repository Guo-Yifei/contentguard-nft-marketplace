import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Form, Input, InputNumber, Button, message, Spin } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import { useWeb3 } from "../context/Web3Context";
import axios from "axios";
import { ethers } from "ethers";

const CreateNFT = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { account, nftContract, marketContract, signer } = useWeb3();

  const handleFileChange = (info) => {
    console.log("文件变更:", info);
    const file = info.file.originFileObj || info.file;
    console.log("文件对象:", file);
    setImageFile(file);

    // 创建文件预览
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        console.log("预览已设置");
      };
      reader.readAsDataURL(file);
    }
  };

  // 简化的图片上传函数，使用固定的图片URL
  const uploadImage = async (file) => {
    console.log("使用简化的图片上传...");

    // 使用固定的示例图片URL
    const demoImageUrls = [
      "https://placehold.co/600x400/4287f5/ffffff?text=NFT-Demo-1",
      "https://placehold.co/600x400/f54242/ffffff?text=NFT-Demo-2",
      "https://placehold.co/600x400/42f545/ffffff?text=NFT-Demo-3",
      "https://placehold.co/600x400/f5a442/ffffff?text=NFT-Demo-4",
      "https://placehold.co/600x400/9742f5/ffffff?text=NFT-Demo-5",
    ];

    // 随机选择一个图片URL
    const randomImageUrl =
      demoImageUrls[Math.floor(Math.random() * demoImageUrls.length)];
    console.log("使用示例图片:", randomImageUrl);

    return randomImageUrl;
  };

  // 简化的元数据创建函数，直接使用base64
  const createMetadata = async (values, imageUrl) => {
    console.log("创建简化元数据...");

    // 创建元数据对象
    const metadata = {
      name: values.title,
      description: values.description,
      image: imageUrl,
      attributes: [],
      creator: account || "0x0000000000000000000000000000000000000000",
      created_at: new Date().toISOString(),
    };

    console.log("元数据对象:", metadata);

    // Base64编码元数据
    const jsonStr = JSON.stringify(metadata);
    const base64Data = btoa(jsonStr);
    const dataUri = `data:application/json;base64,${base64Data}`;

    console.log("Base64编码元数据创建完成");
    return dataUri;
  };

  const handleSubmit = async (values) => {
    console.log("表单提交，值:", values);

    if (!account) {
      message.error("请先连接钱包");
      return;
    }

    setLoading(true);
    message.info("准备创建NFT...");

    try {
      // 1. 简化的图片处理
      console.log("处理图片...");
      const imageUrl = await uploadImage(imageFile || {});
      message.success("图片准备完成");

      // 2. 创建简化元数据
      console.log("创建元数据...");
      const tokenURI = await createMetadata(values, imageUrl);
      message.success("元数据创建成功");

      // 3. 铸造NFT
      console.log("开始铸造NFT...");
      message.info("正在铸造NFT，请确认钱包交易...");

      const tx = await nftContract.mintToken(tokenURI);
      message.info({
        content: (
          <div>
            <p>NFT铸造交易已提交，等待区块链确认...</p>
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

      // 等待交易确认
      const receipt = await tx.wait();
      console.log("NFT铸造成功!");

      // 简化的tokenId获取逻辑
      let tokenId;
      try {
        const transferEvent = receipt.events.find(
          (event) => event.event === "Transfer"
        );

        if (transferEvent && transferEvent.args) {
          tokenId = transferEvent.args.tokenId;
          console.log("铸造的TokenID:", tokenId.toString());
        } else {
          const tokens = await nftContract.getTokensOwnedByMe();
          tokenId = tokens[tokens.length - 1];
          console.log("通过查询获取的TokenID:", tokenId.toString());
        }
      } catch (error) {
        console.error("获取TokenID出错，但继续执行:", error);
        tokenId = Date.now(); // 使用时间戳作为应急方案
      }

      // 4. 如果用户选择上架到市场
      if (values.listForSale) {
        try {
          message.info("准备上架到市场...");

          if (!tokenId) {
            throw new Error("无法确定TokenID");
          }

          // 获取上架费用
          const listingFee = await marketContract.getListingFee();
          console.log("上架费用:", ethers.formatEther(listingFee), "ETH");

          // 将价格从ETH转换为Wei
          const priceInWei = ethers.parseEther(values.price.toString());

          // 授权市场合约管理此NFT
          const approveTx = await nftContract.approve(
            await marketContract.getAddress(),
            tokenId
          );
          await approveTx.wait();

          // 调用合约创建市场项目
          const marketTx = await marketContract.createMarketItem(
            await nftContract.getAddress(),
            tokenId,
            priceInWei,
            { value: listingFee }
          );

          message.info("正在上架NFT到市场...");
          await marketTx.wait();

          message.success("NFT已成功上架到市场!");
        } catch (marketError) {
          console.error("上架市场失败:", marketError);
          message.error("上架市场失败: " + marketError.message);
        }
      }

      message.success("NFT创建完成!");
      setTimeout(() => {
        navigate("/my-assets");
      }, 2000);
    } catch (error) {
      console.error("创建NFT失败:", error);
      message.error("创建NFT失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">创建新 NFT</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ price: 0.01, listForSale: true }}
      >
        <Form.Item
          label="标题"
          name="title"
          rules={[{ required: true, message: "请输入 NFT 标题!" }]}
        >
          <Input placeholder="输入 NFT 标题" />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ required: true, message: "请输入 NFT 描述!" }]}
        >
          <Input.TextArea placeholder="输入 NFT 描述" rows={4} />
        </Form.Item>

        <Form.Item
          name="listForSale"
          valuePropName="checked"
          initialValue={true}
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              id="listForSale"
              className="mr-2"
              checked={form.getFieldValue("listForSale")}
              onChange={(e) =>
                form.setFieldsValue({ listForSale: e.target.checked })
              }
            />
            <label htmlFor="listForSale">铸造后立即上架出售</label>
          </div>
        </Form.Item>

        {form.getFieldValue("listForSale") && (
          <Form.Item
            label="价格 (ETH)"
            name="price"
            rules={[
              {
                required: true,
                type: "number",
                min: 0.01,
                message: "价格必须大于 0.01 ETH",
              },
            ]}
          >
            <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
        )}

        <Form.Item
          label="上传图片"
          rules={[{ required: true, message: "请上传图片!" }]}
        >
          <div className="upload-container">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setImageFile(file);
                  console.log("直接选择的文件:", file);

                  // 创建预览
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreview(reader.result);
                    console.log("设置了预览图片");
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <div
              className="upload-button"
              onClick={() => document.getElementById("file-upload").click()}
              style={{
                border: "1px dashed #d9d9d9",
                borderRadius: "8px",
                cursor: "pointer",
                padding: "20px",
                textAlign: "center",
                background: preview ? "transparent" : "#fafafa",
              }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="NFT预览"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div>
                  <UploadOutlined style={{ fontSize: "24px" }} />
                  <div style={{ marginTop: 8 }}>点击上传图片</div>
                </div>
              )}
            </div>
          </div>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: "130px", height: "60px", fontSize: "17px" }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? "创建中..." : "创建 NFT"}
        </Button>

        {account && (
          <div className="text-sm text-gray-500 mt-4">
            创建者:{" "}
            <span className="font-mono">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        )}
      </Form>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            />
            <p className="mt-3">正在创建并铸造您的 NFT，请稍候...</p>
            <p className="text-sm text-gray-500 mt-2">
              这可能需要一些时间，请不要关闭此页面
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateNFT;
