import React, { useEffect, useState } from "react";
import { Badge, Button, Tooltip, message } from "antd";
import { WalletOutlined, SyncOutlined, LinkOutlined } from "@ant-design/icons";
import { useWeb3 } from "../context/Web3Context";

const NetworkStatus = () => {
  const {
    account,
    networkName,
    chainId,
    balance,
    refreshBalance,
    checkAndSwitchNetwork,
  } = useWeb3();

  const [formattedBalance, setFormattedBalance] = useState("0");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (balance) {
      // 格式化余额，保留4位小数
      const parsed = parseFloat(balance).toFixed(4);
      setFormattedBalance(parsed);
    }
  }, [balance]);

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      const newBalance = await refreshBalance();
      if (newBalance) {
        const parsed = parseFloat(newBalance).toFixed(4);
        setFormattedBalance(parsed);
        message.success("余额已更新");
      }
    } catch (error) {
      console.error("刷新余额失败:", error);
      message.error("刷新余额失败");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSwitchNetwork = async () => {
    if (chainId !== "11155111") {
      const success = await checkAndSwitchNetwork();
      if (success) {
        message.success("已切换到Sepolia测试网");
      } else {
        message.error("切换网络失败");
      }
    }
  };

  if (!account) return null;

  // 根据网络类型设置状态颜色
  let statusColor = "default";
  let statusText = "未知网络";

  if (chainId === "11155111") {
    statusColor = "green";
    statusText = "Sepolia测试网";
  } else if (chainId === "1") {
    statusColor = "blue";
    statusText = "以太坊主网";
  } else {
    statusColor = "red";
    statusText = "不支持的网络";
  }

  return (
    <div className="flex items-center space-x-4 bg-white rounded-lg p-2 shadow-md">
      <Badge status={statusColor} text={statusText} />

      {chainId !== "11155111" && (
        <Button
          size="small"
          type="primary"
          icon={<LinkOutlined />}
          onClick={handleSwitchNetwork}
        >
          切换到Sepolia
        </Button>
      )}

      <Tooltip title="账户余额">
        <div className="flex items-center">
          <WalletOutlined className="mr-1" />
          <span>{formattedBalance} ETH</span>
          <Button
            type="text"
            size="small"
            icon={<SyncOutlined spin={isRefreshing} />}
            onClick={handleRefreshBalance}
            className="ml-1"
          />
        </div>
      </Tooltip>
    </div>
  );
};

export default NetworkStatus;
