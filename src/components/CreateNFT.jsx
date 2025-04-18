import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Form, Input, InputNumber, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createNFT, initializeWeb3 } from '../services/nftService';

const CreateNFT = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isWeb3Initialized, setIsWeb3Initialized] = useState(false);

  const currentWalletAddress = localStorage.getItem('walletAddress');

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        await initializeWeb3();
        setIsWeb3Initialized(true);
      } catch (error) {
        message.error('Failed to initialize Web3: ' + error.message);
      }
    };

    if (currentWalletAddress) {
      initWeb3();
    }
  }, [currentWalletAddress]);

  const handleFileChange = (info) => {
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPreview(base64String);
        console.log("✅ success: image loaded");
      };
      reader.readAsDataURL(file);
    }
  };
  
  

  const handleSubmit = async (values) => {
    if (!isWeb3Initialized) {
      message.error('Web3 is not initialized. Please try again.');
      return;
    }

    setLoading(true);
    try {
      if (!currentWalletAddress) {
        throw new Error('No wallet address found. Please connect your wallet.');
      }
      await createNFT(values, preview, currentWalletAddress);
      message.success('NFT created successfully!');
      navigate('/my-assets');
    } catch (error) {
      message.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New NFT</h1>

      <Form
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ price: 0.0 }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please input title!' }]}
        >
          <Input placeholder="Enter NFT title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please input description!' }]}
        >
          <Input.TextArea placeholder="Enter NFT description" rows={4} />
        </Form.Item>

        <Form.Item
          label="Price (Ether)"
          name="price"
          rules={[{ required: true, type: 'number', min: 0.01 }]}
        >
          <InputNumber min={0.01} step={0.01} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="Upload image">
          <Upload
            className="upload-demo"
            drag
            action="/jsonplaceholder.typicode.com/posts/"
            tip={<div className="el-upload__tip">jpg/png files only</div>}
            onChange={handleFileChange}
            required
          >
            <div className="border border-gray-300 rounded p-4" style={{ border: '1px solid lightgray', padding: '10px', width: '300px', height:'200px', }}>
              <UploadOutlined style={{ fontSize: '40px', color: '#999', marginTop:'60px', }} />
              <div className="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              </div>
          </Upload>
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          style={{ width: '130px', height: '60px', fontSize: '17px' }}
        >
          {loading ? 'Creating...' : 'Create NFT'}
        </Button>

        <div className="text-sm text-gray-500 mt-4">
          Creating as: <span className="font-mono">{currentWalletAddress}</span>
        </div>
      </Form>
    </div>
  );
};

export default CreateNFT;
