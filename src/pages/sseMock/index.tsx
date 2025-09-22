import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Typography, Divider, Switch, InputNumber, Badge, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ClearOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SSEMessage {
  id: string;
  timestamp: string;
  data: any;
  type: string;
}

const SseMock = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [messageInterval, setMessageInterval] = useState(2000); // 消息发送间隔（毫秒）
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟消息数据
  const mockMessages = [
    { type: 'user_login', data: { userId: '12345', username: '张三', loginTime: new Date().toISOString() } },
    { type: 'order_created', data: { orderId: 'ORD-001', amount: 299.99, productName: '无线耳机' } },
    { type: 'payment_success', data: { orderId: 'ORD-001', paymentMethod: '支付宝', amount: 299.99 } },
    { type: 'system_notification', data: { message: '系统将在 5 分钟后进行维护', level: 'warning' } },
    { type: 'chat_message', data: { userId: '67890', username: '李四', message: '你好，有什么可以帮助你的吗？' } },
    { type: 'stock_update', data: { productId: 'P001', stock: 42, productName: '无线耳机' } },
    { type: 'user_logout', data: { userId: '12345', username: '张三', logoutTime: new Date().toISOString() } }
  ];

  // 生成随机消息
  const generateRandomMessage = (): SSEMessage => {
    const randomIndex = Math.floor(Math.random() * mockMessages.length);
    const template = mockMessages[randomIndex];

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: template.type,
      data: {
        ...template.data,
        // 添加一些随机变化
        timestamp: new Date().toISOString(),
        randomId: Math.random().toString(36).substr(2, 9)
      }
    };
  };

  // 模拟 SSE 连接
  const startSSEConnection = () => {
    setConnectionStatus('connecting');
    setIsConnected(false);

    // 模拟连接延迟
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
      message.success('SSE 连接已建立');

      // 开始发送模拟消息
      intervalRef.current = setInterval(() => {
        const newMessage = generateRandomMessage();
        setMessages(prev => [...prev, newMessage]);
      }, messageInterval);
    }, 1000);
  };

  // 停止 SSE 连接
  const stopSSEConnection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    message.info('SSE 连接已断开');
  };

  // 清空消息
  const clearMessages = () => {
    setMessages([]);
    message.success('消息已清空');
  };

  // 自动滚动到底部
  useEffect(() => {
    if (isAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAutoScroll]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 更新消息间隔
  const handleIntervalChange = (value: number | null) => {
    if (value && value >= 500) {
      setMessageInterval(value);

      // 如果正在连接，重新启动定时器
      if (isConnected && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
          const newMessage = generateRandomMessage();
          setMessages(prev => [...prev, newMessage]);
        }, value);
      }
    }
  };

  // 获取状态徽章
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge status="success" text="已连接" />;
      case 'connecting':
        return <Badge status="processing" text="连接中..." />;
      case 'error':
        return <Badge status="error" text="连接错误" />;
      default:
        return <Badge status="default" text="未连接" />;
    }
  };

  // 格式化消息显示
  const formatMessage = (msg: SSEMessage) => {
    const typeColors: Record<string, string> = {
      user_login: '#52c41a',
      user_logout: '#faad14',
      order_created: '#1890ff',
      payment_success: '#52c41a',
      system_notification: '#faad14',
      chat_message: '#722ed1',
      stock_update: '#13c2c2'
    };

    return (
      <div key={msg.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Badge color={typeColors[msg.type] || '#d9d9d9'} text={msg.type} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {new Date(msg.timestamp).toLocaleString()}
          </Text>
        </div>
        <pre style={{ margin: 0, fontSize: 12, background: '#fafafa', padding: 8, borderRadius: 4, overflow: 'auto' }}>
          {JSON.stringify(msg.data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>SSE (Server-Sent Events) Mock 演示</Title>
      <Paragraph type="secondary">
        这是一个模拟 Server-Sent Events 的演示页面，可以实时接收服务器推送的消息。
      </Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* 控制面板 */}
        <Card title="连接控制" extra={getStatusBadge()}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>连接操作：</Text>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={startSSEConnection}
                    disabled={isConnected}
                    loading={connectionStatus === 'connecting'}
                  >
                    开始连接
                  </Button>
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={stopSSEConnection}
                    disabled={!isConnected}
                  >
                    断开连接
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearMessages}
                  >
                    清空消息
                  </Button>
                </Space>
              </div>
            </div>

            <Divider />

            <div>
              <Text strong>设置选项：</Text>
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  <Text>自动滚动：</Text>
                  <Switch
                    checked={isAutoScroll}
                    onChange={setIsAutoScroll}
                    style={{ marginLeft: 8 }}
                  />
                </div>
                <div>
                  <Text>消息间隔 (毫秒)：</Text>
                  <InputNumber
                    min={500}
                    max={10000}
                    step={500}
                    value={messageInterval}
                    onChange={handleIntervalChange}
                    style={{ marginLeft: 8, width: 120 }}
                  />
                </div>
              </div>
            </div>
          </Space>
        </Card>

        {/* 状态信息 */}
        <Card title="连接状态" extra={<SettingOutlined />}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>当前状态：</Text>
              <div style={{ marginTop: 8 }}>
                {getStatusBadge()}
              </div>
            </div>
            <div>
              <Text strong>接收消息数：</Text>
              <div style={{ marginTop: 8 }}>
                <Badge count={messages.length} showZero style={{ backgroundColor: '#52c41a' }} />
              </div>
            </div>
            <div>
              <Text strong>消息发送频率：</Text>
              <div style={{ marginTop: 8 }}>
                <Text code>{messageInterval}ms</Text>
              </div>
            </div>
            <div>
              <Text strong>连接时长：</Text>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {isConnected ? '已连接' : '未连接'}
                </Text>
              </div>
            </div>
          </Space>
        </Card>
      </div>

      {/* 消息显示区域 */}
      <Card
        title={`实时消息 (${messages.length})`}
        extra={
          <Space>
            <Text type="secondary">最新消息在底部</Text>
            {isConnected && <Badge status="processing" text="实时接收中" />}
          </Space>
        }
      >
        <div
          style={{
            height: 500,
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: 6,
            padding: 16,
            backgroundColor: '#fafafa'
          }}
        >
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
              <Text type="secondary">暂无消息，请先建立 SSE 连接</Text>
            </div>
          ) : (
            <>
              {messages.map(formatMessage)}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </Card>

      {/* 说明文档 */}
      <Card title="使用说明" style={{ marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <Title level={4}>功能特性</Title>
            <ul>
              <li>模拟真实的 SSE 连接状态管理</li>
              <li>实时接收和显示服务器推送消息</li>
              <li>支持不同类型的消息格式</li>
              <li>可配置的消息发送频率</li>
              <li>自动滚动到最新消息</li>
              <li>连接状态实时显示</li>
            </ul>
          </div>
          <div>
            <Title level={4}>消息类型</Title>
            <ul>
              <li><Badge color="#52c41a" /> 用户登录/登出</li>
              <li><Badge color="#1890ff" /> 订单创建</li>
              <li><Badge color="#52c41a" /> 支付成功</li>
              <li><Badge color="#faad14" /> 系统通知</li>
              <li><Badge color="#722ed1" /> 聊天消息</li>
              <li><Badge color="#13c2c2" /> 库存更新</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SseMock;