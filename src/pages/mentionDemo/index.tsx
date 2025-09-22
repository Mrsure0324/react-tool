import React, { useState } from 'react';
import { Card, Divider, Typography, Space, Button, message } from 'antd';
import RCMention from 'rc-mentions';
import type { MentionsProps } from 'rc-mentions';
import { Mention, MentionsInput } from 'react-mentions';
import './index.less';
import CustomMentionInput from './CustomMentionInput';

const { Title, Paragraph, Text } = Typography;

// 模拟用户数据
const users = [
  { id: 1, display: '张三', email: 'zhangsan@example.com' },
  { id: 2, display: '李四', email: 'lisi@example.com' },
  { id: 3, display: '王五', email: 'wangwu@example.com' },
  { id: 4, display: '赵六', email: 'zhaoliu@example.com' },
  { id: 5, display: '钱七', email: 'qianqi@example.com' },
];

// 模拟话题数据
const topics = [
  { id: 'react', display: 'React' },
  { id: 'typescript', display: 'TypeScript' },
  { id: 'javascript', display: 'JavaScript' },
  { id: 'nodejs', display: 'Node.js' },
  { id: 'frontend', display: '前端开发' },
];

const MentionDemo: React.FC = () => {
  const [reactMentionValue, setReactMentionValue] = useState('');
  const [singleLineMentionValue, setSingleLineMentionValue] = useState('');
  const [rcMentionValue, setRcMentionValue] = useState('');

  // 完全重写样式配置 - 彻底解决重叠问题
  const mentionStyle = {
    control: {
      backgroundColor: '#fff',
      fontSize: '14px',
      fontWeight: 'normal',
    },
    '&multiLine': {
      control: {

        minHeight: 80,
      },
      highlighter: {
        padding: 12,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        color: 'transparent',
      },
      input: {
        padding: 12,
        border: '1px solid #d9d9d9',
        borderRadius: 6,
        outline: 0,
        backgroundColor: 'transparent',
        fontSize: '14px',
        lineHeight: '1.5',

        minHeight: 80,
        resize: 'vertical',
      },
    },
    '&singleLine': {
      display: 'inline-block',
      width: '100%',
      highlighter: {
        padding: '8px 12px',
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        color: 'transparent',
      },
      input: {
        padding: '8px 12px',
        border: '1px solid #d9d9d9',
        borderRadius: 6,
        outline: 0,
        backgroundColor: 'transparent',
        fontSize: '14px',
        lineHeight: '1.5',

        width: '100%',
      },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        fontSize: '14px',
        borderRadius: 6,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        maxHeight: 200,
        overflowY: 'auto',
        zIndex: 1050,
      },
      item: {
        padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        '&focused': {
          backgroundColor: '#f0f8ff',
        },
      },
    },
  };

  // 处理提交
  const handleSubmit = (type: string, value: string) => {
    message.success(`${type} 内容已提交: ${value}`);
    console.log(`${type} 提交内容:`, value);
  };

  // 自定义mention渲染函数
  const renderMention = (suggestion: any, search: string, highlightedDisplay: React.ReactNode, index: number, focused: boolean) => (
    <div className={`mention-item ${focused ? 'mention-item-focused' : ''}`}>
      <span className="mention-display">{suggestion.display}</span>
      {suggestion.email && (
        <span className="mention-email">{suggestion.email}</span>
      )}
    </div>
  );

  return (
    <div className="mention-demo">

      <CustomMentionInput />

      <Typography>
        <Title level={2}>Mentions 组件使用示例</Title>
        <Paragraph>
          本页面展示了 <Text code>react-mentions</Text> 和 <Text code>rc-mentions</Text> 两个库的使用示例。
          这些组件通常用于实现 @ 用户提及功能，类似于社交媒体平台的评论系统。
        </Paragraph>
      </Typography>

      <Divider />

      {/* React Mentions 示例 */}
      <Card title="React Mentions 示例" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography>
            <Title level={4}>基础用法 - 解决重叠问题</Title>
            <Paragraph>
              在输入框中输入 <Text code>@</Text> 可以触发用户提及，输入 <Text code>#</Text> 可以触发话题提及。
              使用等宽字体确保文本对齐，避免重叠。
            </Paragraph>
          </Typography>

          <div style={{ width: '100%' }}>
            <Text strong>多行输入框 (等宽字体):</Text>
            <div style={{ marginTop: 8 }}>
              <MentionsInput
                value={reactMentionValue}
                onChange={(e) => setReactMentionValue(e.target.value)}
                style={mentionStyle}
                placeholder="请输入内容，使用 @ 提及用户，使用 # 提及话题..."
                className="mentions-input-multiline"
              >
                <Mention
                  trigger="@"
                  data={users}
                  displayTransform={(id, display) => `@${display} `}
                  style={{
                    backgroundColor: '#e6f4ff',
                    position: 'relative',
                    zIndex: 1,
                    color: '#00bcff',
                    textShadow: '1px 1px 1px white, 1px -1px 1px white, -1px 1px 1px white, -1px -1px 1px white',
                    // textDecoration: 'underline',
                    pointerEvents: 'none',

                  }}
                  renderSuggestion={renderMention}
                />
                <Mention
                  trigger="#"
                  data={topics}
                  displayTransform={(id, display) => `#${display}`}
                  style={{
                    backgroundColor: '#fff1f0',
                    color: '#ff4d4f',
                    fontWeight: 'bold',
                  }}
                />
              </MentionsInput>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong>单行输入框 (等宽字体):</Text>
            <div style={{ marginTop: 8 }}>
              <MentionsInput
                singleLine
                value={singleLineMentionValue}
                onChange={(e) => setSingleLineMentionValue(e.target.value)}
                style={mentionStyle}
                placeholder="单行模式，输入 @ 提及用户"
                className="mentions-input-singleline"
              >
                <Mention
                  trigger="@"
                  data={users}
                  displayTransform={(id, display) => `@${display}`}
                  style={{
                    backgroundColor: '#e6f4ff',
                    color: '#1677ff',
                    fontWeight: 'bold',
                  }}
                  renderSuggestion={renderMention}
                />
              </MentionsInput>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <Space>
              <Button
                type="primary"
                onClick={() => handleSubmit('React Mentions (多行)', reactMentionValue)}
              >
                提交多行内容
              </Button>
              <Button
                onClick={() => handleSubmit('React Mentions (单行)', singleLineMentionValue)}
              >
                提交单行内容
              </Button>
            </Space>
          </div>

          <div style={{ marginTop: 16 }}>
            <Text strong>当前多行内容:</Text>
            <div style={{
              background: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
              marginTop: 8,
              minHeight: 40,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',

            }}>
              {reactMentionValue || '暂无内容'}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <Text strong>当前单行内容:</Text>
            <div style={{
              background: '#f5f5f5',
              padding: 8,
              borderRadius: 4,
              marginTop: 8,
              minHeight: 40,

            }}>
              {singleLineMentionValue || '暂无内容'}
            </div>
          </div>
        </Space>
      </Card>

      <Divider />

      <Typography>
        <Title level={3}>重叠问题解决方案</Title>
        <div style={{ marginTop: 16 }}>
          <Title level={4}>主要修复措施:</Title>
          <ul>
            <li>✅ 使用等宽字体 (monospace) 确保字符对齐</li>
            <li>✅ 简化样式配置，移除可能冲突的属性</li>
            <li>✅ 统一 highlighter 和 input 的内边距</li>
            <li>✅ 设置透明背景避免层级冲突</li>
            <li>✅ 移除可能导致重叠的复杂 z-index 配置</li>
          </ul>

          <Title level={4}>技术要点:</Title>
          <ul>
            <li>📝 等宽字体确保每个字符占用相同宽度</li>
            <li>🎨 透明背景让底层高亮可见</li>
            <li>📐 精确的内边距匹配</li>
            <li>🔧 简化的样式配置减少冲突</li>
          </ul>
        </div>
      </Typography>
    </div>
  );
};

export default MentionDemo; 