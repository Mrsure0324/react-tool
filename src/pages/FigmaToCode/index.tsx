import { DownloadOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  message,
  Row,
  Space,
  Tabs,
  Typography,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { FigmaService } from '@/services/figma.service';
import type { FigmaNode } from '@/services/figma.service';
import { FigmaToCodeGenerator } from '@/utils/figma-to-code';
import type { GeneratedComponent } from '@/utils/figma-to-code';
import { FigmaConfig } from '@/utils/figma-config';
import styles from './index.less';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const FigmaToCode: React.FC = () => {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [figmaData, setFigmaData] = useState<FigmaNode | null>(null);
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [activeTab, setActiveTab] = useState('0');

  // 从本地存储加载 API Key
  useEffect(() => {
    const savedApiKey = FigmaConfig.getApiKey();
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  /**
   * 处理 Figma 链接提取
   */
  const handleFetchFigma = async () => {
    if (!figmaUrl) {
      message.error('请输入 Figma 链接');
      return;
    }

    if (!apiKey) {
      message.error('请输入 Figma API Key');
      return;
    }

    setLoading(true);

    try {
      const parsed = FigmaService.parseFigmaUrl(figmaUrl);
      if (!parsed) {
        message.error('无效的 Figma 链接');
        return;
      }

      const figmaService = new FigmaService(apiKey);
      let node: FigmaNode;

      if (parsed.nodeId) {
        // 获取特定节点
        node = await figmaService.getNode(parsed.fileKey, parsed.nodeId);
      } else {
        // 获取整个文件
        const file = await figmaService.getFile(parsed.fileKey);
        node = file.document;
      }

      setFigmaData(node);
      
      // 保存 API Key 到本地存储
      FigmaConfig.saveApiKey(apiKey);
      
      message.success('Figma 数据获取成功！');

      // 自动生成代码
      handleGenerateCode(node);
    } catch (error: any) {
      console.error('Failed to fetch Figma data:', error);
      message.error(error.message || '获取 Figma 数据失败，请检查 API Key 和链接是否正确');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成代码
   */
  const handleGenerateCode = (node?: FigmaNode) => {
    const targetNode = node || figmaData;
    if (!targetNode) {
      message.error('请先获取 Figma 数据');
      return;
    }

    try {
      const generator = new FigmaToCodeGenerator();
      const component = generator.generateComponent(targetNode);
      setGeneratedComponents([component]);
      setActiveTab('0');
      message.success('代码生成成功！');
    } catch (error: any) {
      console.error('Failed to generate code:', error);
      message.error('代码生成失败');
    }
  };

  /**
   * 下载代码
   */
  const handleDownloadCode = (component: GeneratedComponent) => {
    const blob = new Blob([component.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name}.tsx`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('代码已下载');
  };

  /**
   * 复制代码
   */
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success('代码已复制到剪贴板');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2}>Figma to Code 工作流</Title>
        <Paragraph type="secondary">
          将 Figma 设计稿自动转换为 React 组件代码
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 左侧：输入区域 */}
        <Col xs={24} lg={12}>
          <Card title="1. 输入 Figma 信息" className={styles.card}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Figma API Key</Text>
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  在 Figma 账户设置中生成 Personal Access Token
                </Paragraph>
                <Input.Password
                  placeholder="请输入 Figma API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  prefix={<LinkOutlined />}
                />
              </div>

              <div>
                <Text strong>Figma 链接</Text>
                <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 8 }}>
                  支持文件链接或特定节点链接
                </Paragraph>
                <Input
                  placeholder="https://www.figma.com/file/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  prefix={<LinkOutlined />}
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleFetchFigma}
                loading={loading}
                icon={loading ? <LoadingOutlined /> : undefined}
              >
                {loading ? '获取中...' : '获取 Figma 数据'}
              </Button>
            </Space>
          </Card>

          {/* Figma 数据预览 */}
          {figmaData && (
            <Card
              title="2. Figma 数据预览"
              className={styles.card}
              style={{ marginTop: 24 }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>节点名称：</Text>
                  <Text>{figmaData.name}</Text>
                </div>
                <div>
                  <Text strong>节点类型：</Text>
                  <Text>{figmaData.type}</Text>
                </div>
                <div>
                  <Text strong>子节点数量：</Text>
                  <Text>{figmaData.children?.length || 0}</Text>
                </div>

                <Divider />

                <Button
                  type="primary"
                  block
                  onClick={() => handleGenerateCode()}
                  disabled={!figmaData}
                >
                  重新生成代码
                </Button>
              </Space>
            </Card>
          )}
        </Col>

        {/* 右侧：代码预览 */}
        <Col xs={24} lg={12}>
          <Card
            title="3. 生成的代码"
            className={styles.card}
            extra={
              generatedComponents.length > 0 && (
                <Space>
                  <Button
                    size="small"
                    onClick={() => handleCopyCode(generatedComponents[0].code)}
                  >
                    复制代码
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownloadCode(generatedComponents[0])}
                  >
                    下载
                  </Button>
                </Space>
              )
            }
          >
            {generatedComponents.length > 0 ? (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={generatedComponents.map((component, index) => ({
                  key: String(index),
                  label: `${component.name}.tsx`,
                  children: (
                    <div className={styles.codeContainer}>
                      <pre className={styles.codeBlock}>
                        <code>{component.code}</code>
                      </pre>
                    </div>
                  ),
                }))}
              />
            ) : (
              <div className={styles.emptyState}>
                <Text type="secondary">暂无生成的代码</Text>
                <Paragraph type="secondary" style={{ marginTop: 8 }}>
                  请先输入 Figma 信息并获取数据
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
      <Card title="使用说明" className={styles.card} style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <Title level={5}>获取 API Key</Title>
              <Paragraph type="secondary">
                登录 Figma，进入 Settings → Personal Access Tokens，生成新的 Token
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <Title level={5}>输入链接</Title>
              <Paragraph type="secondary">
                复制 Figma 设计稿的链接，可以是整个文件或特定的 Frame/Component
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <Title level={5}>生成代码</Title>
              <Paragraph type="secondary">
                系统会自动将设计稿转换为 React 组件代码，支持下载和复制
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default FigmaToCode;
