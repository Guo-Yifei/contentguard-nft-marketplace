import React, { useState } from 'react';
import { createNFT } from '../services/nftService';
import { useNavigate } from 'react-router-dom';

const CreateNFT = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  
  // 获取当前钱包地址
  const currentWalletAddress = localStorage.getItem('walletAddress');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentWalletAddress) {
        throw new Error('No wallet address found. Please connect your wallet.');
      }

      await createNFT(formData, preview, currentWalletAddress);
      alert('NFT created successfully!');
      navigate('/my-assets');
    } catch (error) {
      alert('Error creating NFT: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New NFT</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price (ETH)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            step="0.001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload Image</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            accept="image/*"
            required
          />
          {preview && (
            <img 
              src={preview} 
              alt="Preview" 
              className="mt-4 max-w-xs rounded"
            />
          )}
        </div>

        <div className="text-sm text-gray-500 mb-4">
          Creating as: {currentWalletAddress}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Creating...' : 'Create NFT'}
        </button>
      </form>
    </div>
  );
};

export default CreateNFT; 