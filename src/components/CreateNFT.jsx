import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Form, Input, InputNumber, Button, message, Card, Row, Col, Typography } from 'antd';
import { UploadOutlined, WalletOutlined } from '@ant-design/icons';
import { createNFT, initializeWeb3 } from '../services/nftService';

const { Title, Text } = Typography;

const CreateNFT = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isWeb3Initialized, setIsWeb3Initialized] = useState(false);
  const [fileList, setFileList] = useState([]);

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

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          setPreview(base64String);
          console.log("✅ success: image loaded");
        };
        reader.readAsDataURL(file);
      }
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (values) => {
    if (!isWeb3Initialized) {
      message.error('Web3 is not initialized. Please try again.');
      return;
    }

    if (!preview) {
      message.error('Please upload an image for your NFT');
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
    <div className="container mx-auto p-6" style={{marginTop: '30px'}}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Card className="shadow-lg">
            <Title level={2} className="text-center mb-8">Create New NFT</Title>
            
            <Form
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ price: 0.01 }}
              size="large"
            >
              <Form.Item
                label={<Text strong>Title</Text>}
                name="title"
                rules={[{ required: true, message: 'Please input title!' }]}
              >
                <Input placeholder="Enter NFT title" />
              </Form.Item>

              <Form.Item
                label={<Text strong>Description</Text>}
                name="description"
                rules={[{ required: true, message: 'Please input description!' }]}
              >
                <Input.TextArea 
                  placeholder="Enter NFT description" 
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong>Price (ETH)</Text>}
                name="price"
                rules={[
                  { required: true, message: 'Please input price!' },
                  { type: 'number', min: 0.01, message: 'Minimum price is 0.01 ETH' }
                ]}
              >
                <InputNumber 
                  min={0.01} 
                  step={0.01} 
                  style={{ width: '100%' }}
                  formatter={value => `Ξ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\Ξ\s?|(,*)/g, '')}
                />
              </Form.Item>

              <Form.Item
                label={<Text strong>NFT Image</Text>}
                name="image"
                rules={[{ required: true, message: 'Please upload an image!' }]}
              >
                <Upload
                  className="upload-demo"
                  listType="picture-card"
                  maxCount={1}
                  fileList={fileList}
                  onChange={handleFileChange}
                  beforeUpload={() => false}
                >
                  {preview ? (
                    <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div>
                      <UploadOutlined style={{ fontSize: '24px' }} />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  {loading ? 'Creating...' : 'Create NFT'}
                </Button>
              </Form.Item>

              <div className="flex items-center justify-center space-x-2 mt-4">
                <WalletOutlined />
                <Text type="secondary">
                  Creating as: {currentWalletAddress?.slice(0, 6)}...{currentWalletAddress?.slice(-4)}
                </Text>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateNFT;
