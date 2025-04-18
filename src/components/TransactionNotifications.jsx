import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Table, Select } from 'antd';
import { CONTRACT_ADDRESSES } from '../contracts/config.js';
import MARKETPLACE_ABI from '../contracts/Marketplace.json';
import NFT_ABI from '../contracts/NFT.json';

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this application');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const currentWalletAddress = await signer.getAddress();
      setWalletAddress(currentWalletAddress);

      // Initialize contracts
      const marketplaceContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.marketplace,
        MARKETPLACE_ABI.abi,
        provider
      );

      const nftContract = new ethers.Contract(
        CONTRACT_ADDRESSES.sepolia.nft,
        NFT_ABI.abi,
        provider
      );

      // Get all market items
      const marketItems = await marketplaceContract.fetchAvailableMarketItems();
      
      // Get transaction history
      const transactionHistory = await Promise.all(
        marketItems.map(async (item) => {
          try {
            // Get NFT metadata
            const tokenURI = await nftContract.tokenURI(item.tokenId);
            const httpURI = tokenURI.replace('ipfs://', IPFS_GATEWAY);
            const metadataResponse = await fetch(httpURI);
            const metadata = await metadataResponse.json();

            // Convert image URL if it's IPFS
            const imageUrl = metadata.image.startsWith('ipfs://') 
              ? metadata.image.replace('ipfs://', IPFS_GATEWAY)
              : metadata.image;

            return {
              key: item.marketItemId.toString(),
              id: item.marketItemId,
              nftId: item.tokenId,
              title: metadata.name,
              imageUrl: imageUrl,
              price: ethers.formatEther(item.price),
              seller: item.seller,
              buyer: item.owner,
              status: item.sold ? 'completed' : 'pending',
              role: item.seller.toLowerCase() === currentWalletAddress.toLowerCase() ? 'seller' : 'buyer',
              timestamp: new Date().toISOString()
            };
          } catch (error) {
            console.error('Error loading transaction:', error);
            return null;
          }
        })
      );

      setTransactions(transactionHistory.filter(tx => tx !== null));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'NFT',
      dataIndex: 'imageUrl',
      key: 'nft',
      width: 70,
      render: (imageUrl) => (
        <img
          src={imageUrl}
          alt="NFT"
          className="h-8 w-8 object-cover rounded"
          style={{width: '30px', height: '30px'}}
        />
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 150,
    },
    {
      title: 'Owner',
      dataIndex: 'buyer',
      key: 'owner',
      render: (buyer, record) => (
        record.role === 'seller' 
          ? `${buyer.slice(0, 6)}...${buyer.slice(-4)}`
          : `${record.seller.slice(0, 6)}...${record.seller.slice(-4)}`
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      ),
    },
    {
      title: 'Price (ETH)',
      dataIndex: 'price',
      key: 'price',
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => role.charAt(0).toUpperCase() + role.slice(1),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'time',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'buying') return tx.role === 'buyer';
    if (activeTab === 'selling') return tx.role === 'seller';
    return true;
  });

  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'buying', label: 'Buying' },
    { value: 'selling', label: 'Selling' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <Select
          defaultValue="all"
          value={activeTab}
          onChange={setActiveTab}
          options={filterOptions}
          style={{ width: 150, marginBottom: '12px' }}
          size="large"
        />
      </div>

      <Table
        className="mt-12"
        dataSource={filteredTransactions}
        columns={columns}
        loading={loading}
        pagination={{
          position: ['bottomCenter'],
          pageSize: 10,
        }}
        bordered
        size="middle"
        scroll={{ x: true }}
      />
    </div>
  );
};

export default TransactionHistory; 