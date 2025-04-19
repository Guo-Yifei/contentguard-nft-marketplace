import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography } from "antd";
import { WalletOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const WalletLogin = () => {
  const [loading, setLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const navigate = useNavigate();

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask wallet!");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xaa36a7") {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xaa36a7" }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0xaa36a7",
                    chainName: "Sepolia",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/demo"],
                    blockExplorerUrls: ["https://sepolia.etherscan.io"],
                  },
                ],
              });
            } else {
              throw switchError;
            }
          }
        }

        localStorage.setItem("walletAddress", accounts[0]);
        navigate("/");
        window.location.reload();
      } else {
        throw new Error("Fail to obtain wallet address");
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      if (error.code === 4001) {
        alert("Connection declined");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInitialView = () => (
    <div className="w-full h-full flex items-center pl-20">
      <div className="w-[600px]">
        <Title
          level={1}
          style={{ color: "#FFFFFF" }}
          className="text-7xl font-normal mb-6 leading-tight"
        >
          <h1
            style={{
              color: "#FFFFFF",
              fontSize: "50px",
              fontWeight: "bold",
              width: "60%",
              marginLeft: "19%",
            }}
          >
            Your gateway to digital collectibles starts here.
          </h1>
        </Title>
        <Text
          style={{ color: "rgba(255, 255, 255, 0.8)", fontWeight: "bold" }}
          className="text-xl leading-relaxed mb-10 block"
        >
          <h5
            style={{
              width: "65%",
              marginLeft: "21%",
              textAlign: "left",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            Welcome to the next generation of digital art and collectibles. Our
            marketplace empowers creators to mint and showcase their unique NFTs
            while providing collectors with a secure platform to discover and
            own extraordinary digital assets.
          </h5>
        </Text>
        <div className="flex flex-col gap-4" style={{ marginTop: "60px" }}>
          <Button
            type="primary"
            size="large"
            onClick={handleConnectWallet}
            loading={loading}
            className="flex items-center justify-center max-w-[280px]"
            style={{
              height: "56px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "#3B82F6",
              borderColor: "#3B82F6",
              borderRadius: "8px",
              color: "#FFFFFF",
              marginRight: "100px",
            }}
          >
            <WalletOutlined style={{ marginRight: "8px" }} />{" "}
            {loading ? "Connecting" : "Connect Wallet"}
          </Button>
          <Button
            type="default"
            size="large"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center justify-center max-w-[280px]"
            style={{
              height: "56px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              borderRadius: "8px",
            }}
          >
            <InfoCircleOutlined style={{ marginRight: "8px" }} />{" "}
            {showInstructions ? "Hidden Instructions" : "Instrucions"}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="mt-8">
      <div
        className="max-w-[60px] p-6 rounded-lg"
        style={{
          backgroundColor: "rgba(143, 74, 37, 0.87)",
          border: "7px solid rgba(32, 17, 2, 0.8)",
          width: "350px",
          textAlign: "left",
          marginLeft: "37%",
          marginTop: "15px",
          alignItems: "center",
          verticalAlign: "middle",
        }}
      >
        <Text
          className="text-xl mb-4 block text-left"
          style={{
            color: "rgba(255, 255, 255, 0.9)",
            marginBottom: "15px",
            marginLeft: "15px",
            marginTop: "30px",
            fontWeight: "bold",
          }}
        >
          How to connect wallet
        </Text>
        <div
          className="space-y-3 text-left"
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            marginLeft: "15px",
            marginBottom: "15px",
          }}
        >
          <div className="flex items-start">
            <Text
              style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "bold" }}
            >
              1. Install Metamask from {" "}
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                metamask.io
              </a>{" "}
            </Text>
          </div>
          <div className="flex items-start">
            <Text
              style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "bold" }}
            >
              2. Choose "Sepolia test net" in MetaMask
            </Text>
          </div>
          <div className="flex items-start">
            <Text
              style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "bold" }}
            >
              3. Create new wallet or import existing one
            </Text>
          </div>
          <div className="flex items-start">
            <Text
              style={{ color: "rgba(255, 255, 255, 0.9)", fontWeight: "bold" }}
            >
              4. Obtain test coins from{" "}
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                sepoliafaucet.com
              </a>{" "}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="flex-grow flex flex-col min-h-screen"
        style={{
          background: `linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('/3d-rendering-concept-nft-non-fungible-token-illustration.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          width: "100vw",
          margin: 0,
          padding: 0,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <div
          className="w-full h-full flex items-center"
          style={{ marginTop: "20%", alignItems: "left" }}
        >
          <div className="pl-20">
            {renderInitialView()}
            {showInstructions && renderInstructions()}
          </div>
        </div>
      </div>
      <div className="bg-transparent py-6 text-center relative z-10">
        <Text className="text-white opacity-80">
          © 2025 NFT Marketplace. All rights reserved.
        </Text>
      </div>
    </div>
  );
};

export default WalletLogin;
