import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag, Avatar } from 'antd';
import { UserOutlined, TagOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface User {
  id: number;
  display: string;
  email?: string;
  avatar?: string;
}

interface Topic {
  id: string;
  display: string;
  icon?: string;
}

interface MarkdownMentionInputProps {
  users?: User[];
  topics?: Topic[];
  placeholder?: string;
  onChange?: (value: string, mentions: any[]) => void;
  defaultValue?: string;
}

const MarkdownMentionInput: React.FC<MarkdownMentionInputProps> = ({
  users = [],
  topics = [],
  placeholder = "输入内容，使用 @ 提及用户，# 提及话题",
  onChange,
  defaultValue = ""
}) => {
  const [rawValue, setRawValue] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [suggestionType, setSuggestionType] = useState<'user' | 'topic'>('user');
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [searchText, setSearchText] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 解析 markdown mention 格式
  const parseMentions = (text: string) => {
    const mentions: any[] = [];

    // 匹配用户 mention: @[显示名](user:id)
    const userMentionRegex = /@\[([^\]]+)\]\(user:(\d+)\)/g;
    let match;
    while ((match = userMentionRegex.exec(text)) !== null) {
      mentions.push({
        type: 'user',
        display: match[1],
        id: match[2],
        start: match.index,
        end: match.index + match[0].length,
        markdown: match[0]
      });
    }

    // 匹配话题 mention: #[显示名](topic:id)
    const topicMentionRegex = /#\[([^\]]+)\]\(topic:([^)]+)\)/g;
    while ((match = topicMentionRegex.exec(text)) !== null) {
      mentions.push({
        type: 'topic',
        display: match[1],
        id: match[2],
        start: match.index,
        end: match.index + match[0].length,
        markdown: match[0]
      });
    }

    return mentions.sort((a, b) => a.start - b.start);
  };

  // 渲染带有 mention 的文本
  const renderTextWithMentions = (text: string) => {
    const mentions = parseMentions(text);

    if (mentions.length === 0) {
      return text;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    mentions.forEach((mention, index) => {
      // 添加普通文本
      if (mention.start > lastIndex) {
        parts.push(text.slice(lastIndex, mention.start));
      }

      // 添加 mention 组件
      if (mention.type === 'user') {
        const user = users.find(u => u.id.toString() === mention.id);
        parts.push(
          <Tag
            key={`mention-${index}`}
            color="blue"
            icon={<UserOutlined />}
            style={{ margin: '0 2px' }}
          >
            {user?.avatar && <span style={{ marginRight: 4 }}>{user.avatar}</span>}
            @{mention.display}
          </Tag>
        );
      } else if (mention.type === 'topic') {
        const topic = topics.find(t => t.id === mention.id);
        parts.push(
          <Tag
            key={`mention-${index}`}
            color="orange"
            icon={<TagOutlined />}
            style={{ margin: '0 2px' }}
          >
            {topic?.icon && <span style={{ marginRight: 4 }}>{topic.icon}</span>}
            #{mention.display}
          </Tag>
        );
      }

      lastIndex = mention.end;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;

    setRawValue(value);

    // 检查是否触发了 mention
    const beforeCursor = value.slice(0, cursorPosition);
    const lastAtMatch = beforeCursor.lastIndexOf('@');
    const lastHashMatch = beforeCursor.lastIndexOf('#');

    const lastTrigger = Math.max(lastAtMatch, lastHashMatch);

    if (lastTrigger >= 0) {
      const triggerChar = value[lastTrigger];
      const afterTrigger = beforeCursor.slice(lastTrigger + 1);

      // 检查触发字符后是否只有字母数字或为空
      if (/^[\w]*$/.test(afterTrigger)) {
        const searchTerm = afterTrigger.toLowerCase();

        if (triggerChar === '@') {
          const filteredUsers = users.filter(user =>
            user.display.toLowerCase().includes(searchTerm)
          );
          if (filteredUsers.length > 0) {
            setSuggestions(filteredUsers);
            setSuggestionType('user');
            setShowSuggestions(true);
            setTriggerPosition(lastTrigger);
            setSearchText(afterTrigger);
            setActiveSuggestion(0);
          } else {
            setShowSuggestions(false);
          }
        } else if (triggerChar === '#') {
          const filteredTopics = topics.filter(topic =>
            topic.display.toLowerCase().includes(searchTerm)
          );
          if (filteredTopics.length > 0) {
            setSuggestions(filteredTopics);
            setSuggestionType('topic');
            setShowSuggestions(true);
            setTriggerPosition(lastTrigger);
            setSearchText(afterTrigger);
            setActiveSuggestion(0);
          } else {
            setShowSuggestions(false);
          }
        }
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }

    // 回调
    if (onChange) {
      const mentions = parseMentions(value);
      onChange(value, mentions);
    }
  };

  // 选择 mention
  const selectMention = (item: any) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const beforeTrigger = rawValue.slice(0, triggerPosition);
    const afterCursor = rawValue.slice(cursorPosition);

    let mentionMarkdown;
    if (suggestionType === 'user') {
      mentionMarkdown = `@[${item.display}](user:${item.id})`;
    } else {
      mentionMarkdown = `#[${item.display}](topic:${item.id})`;
    }

    const newValue = beforeTrigger + mentionMarkdown + afterCursor;
    const newCursorPosition = beforeTrigger.length + mentionMarkdown.length;

    setRawValue(newValue);
    setShowSuggestions(false);

    // 设置光标位置
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);

    // 回调
    if (onChange) {
      const mentions = parseMentions(newValue);
      onChange(newValue, mentions);
    }
  };

  // 键盘事件处理
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[activeSuggestion]) {
          selectMention(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // 获取原始 markdown 文本（用于编辑和保存）
  const getRawMarkdown = () => rawValue;

  // 获取纯文本（移除 markdown 标记）
  const getPlainText = () => {
    return rawValue
      .replace(/@\[([^\]]+)\]\(user:\d+\)/g, '@$1')
      .replace(/#\[([^\]]+)\]\(topic:[^)]+\)/g, '#$1');
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ marginBottom: 16 }}>
        <Text strong>Markdown Mention 输入框</Text>
        <Paragraph type="secondary" style={{ margin: '4px 0' }}>
          输入 @ 提及用户，# 提及话题。支持 Markdown 格式存储和可视化显示。
        </Paragraph>
      </div>

      {/* 输入框 */}
      <textarea
        ref={textareaRef}
        value={rawValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: 120,
          padding: 12,
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          fontSize: 14,
          lineHeight: 1.5,
          resize: 'vertical',
          fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
        }}
      />

      {/* 建议下拉框 */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: 6,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: 200,
            overflowY: 'auto',
            zIndex: 1000
          }}
        >
          {suggestions.map((item, index) => (
            <div
              key={suggestionType === 'user' ? item.id : item.id}
              onClick={() => selectMention(item)}
              style={{
                padding: '8px 12px',
                borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                cursor: 'pointer',
                backgroundColor: index === activeSuggestion ? '#f0f8ff' : 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {suggestionType === 'user' ? (
                <>
                  {item.avatar ? (
                    <span style={{ fontSize: 16 }}>{item.avatar}</span>
                  ) : (
                    <Avatar size={20} icon={<UserOutlined />} />
                  )}
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.display}</div>
                    {item.email && (
                      <div style={{ fontSize: 12, color: '#666' }}>{item.email}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {item.icon ? (
                    <span style={{ fontSize: 16 }}>{item.icon}</span>
                  ) : (
                    <TagOutlined style={{ color: '#1677ff' }} />
                  )}
                  <span style={{ fontWeight: 500 }}>{item.display}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 预览区域 */}
      <div style={{ marginTop: 16 }}>
        <Text strong>可视化预览:</Text>
        <div style={{
          background: '#f5f5f5',
          padding: 12,
          borderRadius: 6,
          marginTop: 8,
          minHeight: 60,
          lineHeight: 1.6,
          border: '1px solid #e8e8e8'
        }}>
          {rawValue ? renderTextWithMentions(rawValue) : (
            <Text type="secondary">预览区域将显示带图标的 mention...</Text>
          )}
        </div>
      </div>

      {/* 原始数据展示 */}
      <div style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>原始 Markdown:</Text>
            <div style={{
              background: '#fafafa',
              padding: 8,
              borderRadius: 4,
              fontFamily: 'Monaco, monospace',
              fontSize: 12,
              border: '1px solid #e8e8e8',
              wordBreak: 'break-all'
            }}>
              {rawValue || '暂无内容'}
            </div>
          </div>

          <div>
            <Text strong>纯文本输出:</Text>
            <div style={{
              background: '#fafafa',
              padding: 8,
              borderRadius: 4,
              fontSize: 12,
              border: '1px solid #e8e8e8'
            }}>
              {getPlainText() || '暂无内容'}
            </div>
          </div>

          <div>
            <Text strong>解析到的 Mentions:</Text>
            <div style={{
              background: '#fafafa',
              padding: 8,
              borderRadius: 4,
              fontSize: 12,
              border: '1px solid #e8e8e8'
            }}>
              <pre>{JSON.stringify(parseMentions(rawValue), null, 2)}</pre>
            </div>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default MarkdownMentionInput; 