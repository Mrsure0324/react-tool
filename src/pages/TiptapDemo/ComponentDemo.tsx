import React, { useRef, useState } from 'react';
import TiptapMentionsEditor, {
  TiptapMentionsEditorRef,
  ExtractedContent,
  User
} from '@/components/TiptapMentionsEditor';
import styles from './ComponentDemo.module.scss';

// 自定义用户数据
const customUsers: User[] = [
  { id: 1, name: '张三', email: 'zhangsan@company.com', avatar: '👨‍💼' },
  { id: 2, name: '李四', email: 'lisi@company.com', avatar: '👩‍💻' },
  { id: 3, name: '王五', email: 'wangwu@company.com', avatar: '👨‍🎨' },
  { id: 4, name: '赵六', email: 'zhaoliu@company.com', avatar: '👩‍🔬' },
  { id: 5, name: '孙七', email: 'sunqi@company.com', avatar: '👨‍🚀' },
];

const ComponentDemo: React.FC = () => {
  const editorRef = useRef<TiptapMentionsEditorRef>(null);
  const [content, setContent] = useState<ExtractedContent | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  // 处理内容变化
  const handleChange = (newContent: ExtractedContent) => {
    setContent(newContent);
    console.log('Content changed:', newContent);
  };

  // 获取内容
  const getContent = () => {
    if (editorRef.current) {
      const extractedContent = editorRef.current.getContent();
      setContent(extractedContent);
      alert('内容已获取并显示在下方！');
    }
  };

  // 清空内容
  const clearContent = () => {
    if (editorRef.current) {
      editorRef.current.clearContent();
      setContent(null);
    }
  };

  // 设置内容
  const setInitialContent = () => {
    if (editorRef.current) {
      editorRef.current.setContent('<p>这是预设内容，包含 <span data-type="mention" data-id="1" data-label="张三">@张三</span> 的提及。</p>');
    }
  };

  // 聚焦编辑器
  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // 插入提及
  const insertMention = () => {
    if (editorRef.current) {
      const randomUser = customUsers[Math.floor(Math.random() * customUsers.length)];
      editorRef.current.insertMention(randomUser);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚀 TiptapMentionsEditor 组件演示</h1>

      <div className={styles.section}>
        <h2>✍️ 编辑器</h2>
        <TiptapMentionsEditor
          ref={editorRef}
          users={customUsers}
          placeholder="在这里输入内容，使用 @ 提及用户..."
          onChange={handleChange}
          disabled={isDisabled}
          className={styles.customEditor}
        />
      </div>

      <div className={styles.controls}>
        <h3>🎛️ 控制面板</h3>
        <div className={styles.buttonGroup}>
          <button onClick={getContent} className={styles.btn}>
            📄 获取内容
          </button>
          <button onClick={clearContent} className={styles.btn}>
            🗑️ 清空内容
          </button>
          <button onClick={setInitialContent} className={styles.btn}>
            📝 设置预设内容
          </button>
          <button onClick={focusEditor} className={styles.btn}>
            🎯 聚焦编辑器
          </button>
          <button onClick={insertMention} className={styles.btn}>
            👥 插入随机提及
          </button>
          <button
            onClick={() => setIsDisabled(!isDisabled)}
            className={`${styles.btn} ${isDisabled ? styles.btnSuccess : styles.btnWarning}`}
          >
            {isDisabled ? '✅ 启用编辑器' : '🔒 禁用编辑器'}
          </button>
        </div>
      </div>

      {content && (
        <div className={styles.output}>
          <h3>📤 提取的内容</h3>

          <div className={styles.contentSection}>
            <h4>📝 纯文本</h4>
            <div className={styles.codeBlock}>
              {content.text || '(空)'}
            </div>
          </div>

          <div className={styles.contentSection}>
            <h4>🔗 带提及的文本</h4>
            <div className={styles.codeBlock}>
              {content.textWithMentions || '(空)'}
            </div>
          </div>

          <div className={styles.contentSection}>
            <h4>👥 提及的用户</h4>
            <div className={styles.mentions}>
              {content.mentions.length > 0 ? (
                content.mentions.map((mention, index) => (
                  <div key={index} className={styles.mentionTag}>
                    @{mention.name} (ID: {mention.id})
                  </div>
                ))
              ) : (
                <span className={styles.empty}>没有提及任何用户</span>
              )}
            </div>
          </div>

          <div className={styles.contentSection}>
            <h4>📄 HTML 内容</h4>
            <details className={styles.details}>
              <summary>点击查看 HTML</summary>
              <pre className={styles.codeBlock}>
                {content.html}
              </pre>
            </details>
          </div>

          <div className={styles.contentSection}>
            <h4>📋 JSON 数据</h4>
            <details className={styles.details}>
              <summary>点击查看 JSON</summary>
              <pre className={styles.codeBlock}>
                {JSON.stringify(content.json, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      <div className={styles.features}>
        <h3>✨ 组件特性</h3>
        <ul>
          <li>🎯 <strong>完全可控:</strong> 通过 ref 获取和设置内容</li>
          <li>📊 <strong>多种输出:</strong> 支持纯文本、HTML、JSON 等格式</li>
          <li>👥 <strong>提及功能:</strong> 完整的用户提及和搜索</li>
          <li>🎨 <strong>CSS Modules:</strong> 样式隔离，支持自定义主题</li>
          <li>📱 <strong>响应式设计:</strong> 支持移动端和桌面端</li>
          <li>♿ <strong>无障碍访问:</strong> 完整的键盘导航支持</li>
          <li>🌙 <strong>暗色主题:</strong> 自动适配系统主题</li>
          <li>🔄 <strong>实时回调:</strong> onChange 事件监听内容变化</li>
        </ul>
      </div>
    </div>
  );
};

export default ComponentDemo; 