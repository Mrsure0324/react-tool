import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, List, Avatar } from 'antd';

interface MentionUser {
  id: string;
  display: string;
  email?: string;
  avatar?: string;
}

interface MentionTopic {
  id: string;
  display: string;
  icon?: string;
}

interface CustomMentionInputProps {
  users?: MentionUser[];
  topics?: MentionTopic[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const CustomMentionInput: React.FC<CustomMentionInputProps> = ({
  users = [],
  topics = [],
  placeholder = "输入 @ 提及用户，# 提及话题",
  value = '',
  onChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<(MentionUser | MentionTopic)[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionType, setMentionType] = useState<'user' | 'topic' | null>(null);
  const [mentionStart, setMentionStart] = useState(0);
  const [currentSearch, setCurrentSearch] = useState('');

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // 解析文本中的mention
  const parseMentions = (text: string) => {
    const mentionRegex = /([@#])(\w+)/g;
    const parts: Array<{ type: 'text' | 'mention', content: string, mentionType?: 'user' | 'topic', data?: any }> = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // 添加前面的普通文本
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // 添加mention
      const trigger = match[1];
      const mentionText = match[2];
      const isMentionType = trigger === '@' ? 'user' : 'topic';
      const dataSource = isMentionType === 'user' ? users : topics;
      const mentionData = dataSource.find(item => item.display === mentionText);

      parts.push({
        type: 'mention',
        content: match[0],
        mentionType: isMentionType,
        data: mentionData
      });

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts;
  };

  // 渲染带样式的文本
  const renderStyledText = (text: string) => {
    const parts = parseMentions(text);

    return parts.map((part, index) => {
      if (part.type === 'mention' && part.data) {
        const isUser = part.mentionType === 'user';
        const className = isUser ? 'custom-mention-user' : 'custom-mention-topic';
        const icon = isUser ? (part.data as MentionUser).avatar : (part.data as MentionTopic).icon;

        return (
          <span key={index} className={className}>
            {icon && <span>{icon}</span>}
            <span>{part.content}</span>
          </span>
        );
      }
      return <span key={index}>{part.content}</span>;
    });
  };

  // 检查当前光标位置是否在mention触发状态
  const checkMentionTrigger = (text: string, cursorPos: number) => {
    const beforeCursor = text.slice(0, cursorPos);
    const mentionMatch = beforeCursor.match(/(?:^|\s)([@#])(\w*)$/);

    if (mentionMatch) {
      const trigger = mentionMatch[1];
      const search = mentionMatch[2];
      const startPos = beforeCursor.length - mentionMatch[0].length + mentionMatch[0].indexOf(trigger);

      setMentionType(trigger === '@' ? 'user' : 'topic');
      setMentionStart(startPos);
      setCurrentSearch(search);

      // 过滤建议
      const dataSource = trigger === '@' ? users : topics;
      const filtered = dataSource.filter(item =>
        item.display.toLowerCase().includes(search.toLowerCase())
      );

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionType(null);
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    setInputValue(newValue);
    onChange?.(newValue);

    checkMentionTrigger(newValue, cursorPos);
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectSuggestion(selectedIndex);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // 选择建议
  const selectSuggestion = (index: number) => {
    if (!inputRef.current || !suggestions[index]) return;

    const suggestion = suggestions[index];
    const trigger = mentionType === 'user' ? '@' : '#';
    const replacement = `${trigger}${suggestion.display} `;

    const beforeMention = inputValue.slice(0, mentionStart);
    const afterCursor = inputValue.slice(inputRef.current.selectionStart || 0);
    const newValue = beforeMention + replacement + afterCursor;

    setInputValue(newValue);
    onChange?.(newValue);
    setShowSuggestions(false);

    // 设置光标位置
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + replacement.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        inputRef.current.focus();
      }
    }, 0);
  };

  // 处理光标位置变化
  const handleSelectionChange = () => {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart || 0;
    checkMentionTrigger(inputValue, cursorPos);
  };

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* 背景层 - 显示带样式的文本 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          padding: '12px',
          border: '1px solid transparent',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          color: 'transparent',
          pointerEvents: 'none',
          zIndex: 1,
          minHeight: '80px',
          overflow: 'hidden',
        }}
      >
        {renderStyledText(inputValue)}
      </div>

      {/* 输入框 */}
      <textarea
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onSelect={handleSelectionChange}
        onBlur={() => {
          // 延迟隐藏建议列表，允许点击选择
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          minHeight: '80px',
          padding: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          fontSize: '14px',
          lineHeight: '1.5',
          background: 'transparent',
          color: 'rgba(0, 0, 0, 0.85)',
          resize: 'vertical',
          outline: 'none',
        }}
      />

      {/* 建议列表 */}
      {showSuggestions && (
        <Card
          ref={suggestionRef}
          size="small"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: 4,
            maxHeight: 200,
            overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
          bodyStyle={{ padding: 0 }}
        >
          <List
            size="small"
            dataSource={suggestions}
            renderItem={(item, index) => {
              const isUser = mentionType === 'user';
              const user = item as MentionUser;
              const topic = item as MentionTopic;

              return (
                <List.Item
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: index === selectedIndex ? '#f0f8ff' : 'transparent',
                  }}
                  onClick={() => selectSuggestion(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    {isUser ? (
                      <>
                        <span style={{ fontSize: 16 }}>{user.avatar || '👤'}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{user.display}</div>
                          {user.email && (
                            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user.email}</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 16 }}>{topic.icon || '🏷️'}</span>
                        <span style={{ fontWeight: 500, fontSize: 14 }}>{topic.display}</span>
                      </>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </Card>
      )}
    </div>
  );
};

export default CustomMentionInput; 