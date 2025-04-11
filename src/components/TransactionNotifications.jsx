import React, { useEffect, useState } from 'react';
import { getUserTransactions, handleTransaction } from '../services/transactionService';
import { Button } from 'antd';

const TransactionNotifications = ({ userAddress }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'buying', 'selling'

  useEffect(() => {
    loadTransactions();
  }, [userAddress]);

  const loadTransactions = async () => {
    try {
      const userTxs = await getUserTransactions(userAddress);
      setTransactions(userTxs);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionResponse = async (transactionId, approved) => {
    try {
      await handleTransaction(transactionId, approved);
      
      // 刷新交易列表
      loadTransactions();
      
      alert(
        approved 
          ? 'Transaction completed successfully! NFT ownership has been transferred.' 
          : 'Transaction rejected successfully!'
      );
    } catch (error) {
      alert('Error processing transaction: ' + error.message);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'buying') return tx.role === 'buyer';
    if (activeTab === 'selling') return tx.role === 'seller';
    return true;
  });

  const getStatusBadgeClass = (status) => {
    const baseClass = 'px-2 py-1 rounded text-sm font-medium';
    switch (status) {
      case 'pending':
        return `${baseClass} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClass} bg-red-100 text-red-800`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) return <div>Loading transactions...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">My Cart</h2>
      
      {/* 标签切换 */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded ${
            activeTab === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          style={{ 
            backgroundColor: '#B2FBA5',
            borderColor: '#1890ff',
            marginRight: '15px',
            width: '60px',
            height: '30px',
          }}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('buying')}
          className={`px-4 py-2 rounded ${
            activeTab === 'buying' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          style={{ 
            backgroundColor: '#FFC300',
            borderColor: '#1890ff',
            marginRight: '15px',
            width: '60px',
            height: '30px',
          }}
        >
          Buying
        </button>
        <button
          onClick={() => setActiveTab('selling')}
          className={`px-4 py-2 rounded ${
            activeTab === 'selling' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
          style={{ 
            backgroundColor: '#FFA07A',
            borderColor: '#1890ff',
            marginRight: '15px',
            width: '60px',
            height: '30px',
          }}
        >
          Selling
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <p>No transactions found</p>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <div key={transaction.id} className="border p-4 rounded shadow" style={{margin: '50px',}}>
              <div className="flex justify-between items-center mb-4">
                <div style={{border:'2px solid lightgray', width: '400px',height:'180px', marginLeft: '19%',}}>
                  <div style={{textAlign:'left', paddingLeft: '30px',}}>
                    <p className="font-medium">NFT ID: {transaction.nftId}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.role === 'buyer' ? 'Buying from: ' : 'Selling to: '}
                      {transaction.role === 'buyer' 
                        ? transaction.seller.slice(0, 6) + '...' + transaction.seller.slice(-4)
                        : transaction.buyer.slice(0, 6) + '...' + transaction.buyer.slice(-4)
                      }
                    </p>
                    <p className="text-sm text-gray-500">Price: {transaction.price} ETH</p>
                  </div>
                  <span className={getStatusBadgeClass(transaction.status)} style={{
                    color: transaction.status === 'pending' ? 'red' : 'green',
                  }}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </div>

              {transaction.role === 'buyer' && transaction.status === 'pending' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2" color='red'>
                    Do you want to approve this transaction?
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleTransactionResponse(transaction.id, true)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1"
                      style={{ 
                        marginRight: '15px',
                      }}
                    >
                      Approve & Transfer NFT
                    </button>
                    <button
                      onClick={() => handleTransactionResponse(transaction.id, false)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionNotifications; 