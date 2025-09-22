import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Button, Input, Space, Typography, Divider, Form, Slider, Switch } from 'antd';
import { CopyOutlined, ReloadOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const { TextArea } = Input;
const { Title, Text } = Typography;

// 默认的Markdown内容示例
const defaultMarkdown = `# React Markdown Demo

这是一个 **react-markdown** 调试demo页面，支持各种Markdown语法。

## 文本格式

- **粗体文本**
- *斜体文本*
- ~~删除线文本~~
- \`内联代码\`

## 列表

### 无序列表
- 项目1
- 项目2
  - 嵌套项目1
  - 嵌套项目2

### 有序列表
1. 第一项
2. 第二项
3. 第三项

## 代码块

\`\`\`javascript
function greeting(name) {
  console.log('Hello, ' + name + '!');
  return \`欢迎使用 React Markdown，\${name}!\`;
}

greeting('开发者');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

## 表格

| 功能 | 支持 | 备注 |
|------|------|------|
| 基本语法 | ✅ | 标题、段落、列表等 |
| 代码高亮 | ✅ | 使用 rehype-highlight |
| GFM扩展 | ✅ | 表格、删除线、任务列表 |
| 数学公式 | ❌ | 需要额外插件 |

## 任务列表

- [x] 完成基本功能
- [x] 添加代码高亮
- [ ] 添加数学公式支持
- [ ] 添加图表支持

## 引用

> 这是一个引用块。
> 
> 可以包含多行内容。
> 
> > 嵌套引用也是支持的。

## 链接和图片

[React Markdown 官方文档](https://github.com/remarkjs/react-markdown)

![React Logo](https://reactjs.org/logo-og.png)

## 分割线

---

## HTML标签

react-markdown 默认支持一些安全的HTML标签：

<div style="background: #f0f0f0; padding: 10px; border-radius: 5px;">
这是一个HTML div元素
</div>

<details>
<summary>点击展开详情</summary>

这里是隐藏的内容，点击上面的summary可以展开或收起。

</details>
`;

export default function ReactMarkdownDemo() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [showSource, setShowSource] = useState(false);

  // 流式数据相关状态
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState(50); // 流式速度（毫秒）
  const [customInput, setCustomInput] = useState('');
  const [enableWordByWord, setEnableWordByWord] = useState(false);

  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const sourceTextRef = useRef('');

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
  };

  const handleReset = () => {
    setMarkdown(defaultMarkdown);
  };

  // 开始流式渲染
  const startStreaming = (text: string) => {
    if (!text.trim()) return;

    sourceTextRef.current = text;
    currentIndexRef.current = 0;
    setStreamingText('');
    setIsStreaming(true);
    setIsPaused(false);

    streamingIntervalRef.current = setInterval(() => {
      if (currentIndexRef.current >= sourceTextRef.current.length) {
        stopStreaming();
        return;
      }

      if (enableWordByWord) {
        // 按词渲染
        const words = sourceTextRef.current.split(' ');
        const currentWordIndex = Math.floor(currentIndexRef.current / (sourceTextRef.current.length / words.length));
        const wordsToShow = words.slice(0, currentWordIndex + 1);
        setStreamingText(wordsToShow.join(' '));
        currentIndexRef.current += Math.ceil(sourceTextRef.current.length / words.length);
      } else {
        // 按字符渲染
        setStreamingText(sourceTextRef.current.slice(0, currentIndexRef.current + 1));
        currentIndexRef.current += 1;
      }
    }, streamSpeed);
  };

  // 暂停/恢复流式渲染
  const togglePause = () => {
    if (isPaused) {
      // 恢复
      setIsPaused(false);
      streamingIntervalRef.current = setInterval(() => {
        if (currentIndexRef.current >= sourceTextRef.current.length) {
          stopStreaming();
          return;
        }

        if (enableWordByWord) {
          const words = sourceTextRef.current.split(' ');
          const currentWordIndex = Math.floor(currentIndexRef.current / (sourceTextRef.current.length / words.length));
          const wordsToShow = words.slice(0, currentWordIndex + 1);
          setStreamingText(wordsToShow.join(' '));
          currentIndexRef.current += Math.ceil(sourceTextRef.current.length / words.length);
        } else {
          setStreamingText(sourceTextRef.current.slice(0, currentIndexRef.current + 1));
          currentIndexRef.current += 1;
        }
      }, streamSpeed);
    } else {
      // 暂停
      setIsPaused(true);
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
        streamingIntervalRef.current = null;
      }
    }
  };

  // 停止流式渲染
  const stopStreaming = () => {
    setIsStreaming(false);
    setIsPaused(false);
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // 当速度改变时，如果正在流式渲染且未暂停，需要重新设置定时器
  useEffect(() => {
    if (isStreaming && !isPaused && streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = setInterval(() => {
        if (currentIndexRef.current >= sourceTextRef.current.length) {
          stopStreaming();
          return;
        }

        if (enableWordByWord) {
          const words = sourceTextRef.current.split(' ');
          const currentWordIndex = Math.floor(currentIndexRef.current / (sourceTextRef.current.length / words.length));
          const wordsToShow = words.slice(0, currentWordIndex + 1);
          setStreamingText(wordsToShow.join(' '));
          currentIndexRef.current += Math.ceil(sourceTextRef.current.length / words.length);
        } else {
          setStreamingText(sourceTextRef.current.slice(0, currentIndexRef.current + 1));
          currentIndexRef.current += 1;
        }
      }, streamSpeed);
    }
  }, [streamSpeed, enableWordByWord]);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>React Markdown 调试Demo</Title>
      <Text type="secondary">
        这个页面用于调试和测试 react-markdown 组件的各种功能和语法支持。
      </Text>

      <Divider />

      {/* 流式测试表单 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="流式数据测试" size="small">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="自定义测试文本">
                    <TextArea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="输入你想要测试的Markdown文本..."
                      rows={4}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="流式渲染控制">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlayCircleOutlined />}
                          onClick={() => startStreaming(customInput || defaultMarkdown)}
                          disabled={isStreaming}
                        >
                          开始流式渲染
                        </Button>
                        <Button
                          icon={isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                          onClick={togglePause}
                          disabled={!isStreaming}
                        >
                          {isPaused ? '恢复' : '暂停'}
                        </Button>
                        <Button
                          icon={<StopOutlined />}
                          onClick={stopStreaming}
                          disabled={!isStreaming}
                        >
                          停止
                        </Button>
                      </Space>

                      <div>
                        <Text>渲染速度: {streamSpeed}ms/字符</Text>
                        <Slider
                          min={10}
                          max={200}
                          value={streamSpeed}
                          onChange={setStreamSpeed}
                          style={{ marginTop: '8px' }}
                        />
                      </div>

                      <div>
                        <Switch
                          checked={enableWordByWord}
                          onChange={setEnableWordByWord}
                          style={{ marginRight: '8px' }}
                        />
                        <Text>按词渲染（而非按字符）</Text>
                      </div>
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space>
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
            >
              复制Markdown
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置内容
            </Button>
            <Button
              type={showSource ? 'primary' : 'default'}
              onClick={() => setShowSource(!showSource)}
            >
              {showSource ? '隐藏源码' : '显示源码'}
            </Button>
          </Space>
        </Col>

        {showSource && (
          <Col span={24}>
            <Card title="Markdown 源码编辑器" size="small">
              <TextArea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={20}
                style={{ fontFamily: 'monospace' }}
              />
            </Card>
          </Col>
        )}

        {/* 流式渲染结果 */}
        {isStreaming && (
          <Col span={24}>
            <Card
              title={
                <Space>
                  <span>流式渲染结果</span>
                  <Text type="secondary">
                    ({isPaused ? '已暂停' : '渲染中...'})
                    进度: {Math.round((currentIndexRef.current / (sourceTextRef.current.length || 1)) * 100)}%
                  </Text>
                </Space>
              }
              size="small"
              extra={
                <Text type="secondary">
                  实时流式渲染效果
                </Text>
              }
            >
              <MarkdownRenderer
                content={streamingText}
                containerStyle={{
                  minHeight: '300px',
                  padding: '16px',
                  border: '1px solid #e6f7ff',
                  borderRadius: '6px',
                  backgroundColor: '#f6ffff'
                }}
              />
            </Card>
          </Col>
        )}

        <Col span={24}>
          <Card
            title="完整渲染结果"
            size="small"
            extra={
              <Text type="secondary">
                使用 react-markdown + remark-gfm + rehype-highlight
              </Text>
            }
          >
            <MarkdownRenderer
              content={markdown}
              containerStyle={{
                minHeight: '400px',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '6px',
                backgroundColor: '#fafafa'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
} 