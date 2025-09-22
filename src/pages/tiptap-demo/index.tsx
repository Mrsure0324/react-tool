import React, { useRef } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Space, message } from 'antd';
import TiptapMentionsEditor, { type TiptapMentionsEditorRef, type User } from '@/components/TiptapMentionsEditor';

const TiptapDemo: React.FC = () => {
  const editorRef = useRef<TiptapMentionsEditorRef>(null);

  // 模拟用户数据
  const mockUsers: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
    { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
  ];

  const handleGetContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.getContent();
      console.log('Editor content:', content);
      message.success('内容已输出到控制台');
    }
  };

  const handleClearContent = () => {
    if (editorRef.current) {
      editorRef.current.clearContent();
      message.success('内容已清空');
    }
  };

  const handleSetContent = () => {
    if (editorRef.current) {
      const sampleContent = `
        <p>这是一个示例内容，包含：</p>
        <ul>
          <li>普通文本</li>
          <li><strong>粗体文本</strong></li>
          <li><em>斜体文本</em></li>
        </ul>
        <p>你可以输入 @ 来提及用户</p>
      `;
      editorRef.current.setContent(sampleContent);
      message.success('示例内容已设置');
    }
  };

  return (
    <PageContainer
      title="Tiptap 编辑器 Demo"
      subTitle="测试带有 @ 提及功能的富文本编辑器"
    >
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Button onClick={handleGetContent} type="primary">
              获取内容
            </Button>
            <Button onClick={handleSetContent}>
              设置示例内容
            </Button>
            <Button onClick={handleClearContent} danger>
              清空内容
            </Button>
          </Space>

          <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px' }}>
            <TiptapMentionsEditor
              ref={editorRef}
              users={mockUsers}
              placeholder="输入 @ 来提及用户..."
              onChange={(content) => {
                console.log('Content changed:', content);
              }}
              style={{ minHeight: '200px' }}
            />
          </div>

          <Card title="使用说明" size="small">
            <ul>
              <li>输入 <code>@</code> 符号可以触发用户提及功能</li>
              <li>支持基本的富文本格式：<strong>粗体</strong>、<em>斜体</em>、列表等</li>
              <li>使用上方按钮测试编辑器的各种功能</li>
              <li>内容变化会实时输出到浏览器控制台</li>
            </ul>
          </Card>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default TiptapDemo; 