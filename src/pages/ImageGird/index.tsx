import React, { useState } from 'react';
import { Form, Slider, InputNumber, Card, Space, Typography } from 'antd';
import Gird from './gird';

const { Title, Text } = Typography;

const ImageGird = () => {
  const [imageCount, setImageCount] = useState(9);
  const [gridWidth, setGridWidth] = useState(50);

  // 示例图片数组
  const allImages = [
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg586z1QrgYSMRyc3bN29zq2k8TcvEW3Awbw&s',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5uhnFszy0eh_cag_IRQp0psOXVJncoLhkHA&s',

    'https://vip-go.premiumbeat.com/wp-content/uploads/2018/05/social-media-cover.jpg?resize=875,490',
    'https://picsum.photos/300/300?random=1',
    'https://picsum.photos/300/400?random=2',
    'https://picsum.photos/400/300?random=3',
    'https://picsum.photos/300/300?random=4',
    'https://picsum.photos/350/350?random=5',
    'https://picsum.photos/300/300?random=6',
    'https://picsum.photos/300/300?random=7',
    'https://picsum.photos/300/300?random=8',
    'https://picsum.photos/300/300?random=9',
    'https://picsum.photos/300/300?random=10',
    'https://picsum.photos/300/300?random=11',
    'https://picsum.photos/300/300?random=12',
    'https://picsum.photos/300/300?random=13',
    'https://picsum.photos/300/300?random=14',
    'https://picsum.photos/300/300?random=15',
    'https://picsum.photos/300/300?random=16',
    'https://picsum.photos/300/300?random=17',
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="图片网格测试" style={{ marginBottom: '24px' }}>
        <Form layout="vertical">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>图片数量: {imageCount}</Text>
              <Slider
                min={1}
                max={20}
                value={imageCount}
                onChange={setImageCount}
                marks={{
                  1: '1',
                  5: '5',
                  10: '10',
                  15: '15',
                  20: '20'
                }}
                style={{ marginTop: '8px' }}
              />
            </div>

            <div>
              <Text strong>网格宽度: {gridWidth}%</Text>
              <Slider
                min={20}
                max={100}
                value={gridWidth}
                onChange={setGridWidth}
                marks={{
                  20: '20%',
                  50: '50%',
                  80: '80%',
                  100: '100%'
                }}
                style={{ marginTop: '8px' }}
              />
            </div>

            <Space>
              <Text>快速设置图片数量:</Text>
              {[1, 2, 3, 4, 5, 9, 12, 15, 20].map(num => (
                <a
                  key={num}
                  onClick={() => setImageCount(num)}
                  style={{
                    color: imageCount === num ? '#1890ff' : undefined,
                    fontWeight: imageCount === num ? 'bold' : undefined
                  }}
                >
                  {num}张
                </a>
              ))}
            </Space>
          </Space>
        </Form>
      </Card>

      <Card title={`当前显示 ${imageCount} 张图片`}>
        <Gird
          images={allImages.slice(0, imageCount)}
          width={gridWidth}
        />
      </Card>
    </div>
  );
};

export default ImageGird;