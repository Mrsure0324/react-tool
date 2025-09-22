import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, ReactRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import './index.less';

// 模拟用户数据
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: '👩‍💼' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: '👨‍💻' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', avatar: '👨‍🎨' },
  { id: 4, name: 'Diana Prince', email: 'diana@example.com', avatar: '👩‍🦸' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', avatar: '👩‍🔬' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', avatar: '👨‍🏫' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', avatar: '👩‍⚕️' },
  { id: 8, name: 'Henry Ford', email: 'henry@example.com', avatar: '👨‍🔧' },
];

// 提及列表组件
interface MentionListProps {
  items: typeof users;
  command: (item: { id: number; label: string }) => void;
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = items[index];
      if (item) {
        command({ id: item.id, label: item.name });
      }
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + items.length - 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          selectItem(selectedIndex);
          return true;
        }

        return false;
      },
    }));

    useEffect(() => setSelectedIndex(0), [items]);

    if (items.length === 0) {
      return (
        <div className="mention-list">
          <div className="mention-item mention-item--empty">No users found</div>
        </div>
      );
    }

    return (
      <div className="mention-list">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`mention-item ${index === selectedIndex ? 'mention-item--selected' : ''
              }`}
            onClick={() => selectItem(index)}
          >
            <div className="mention-avatar">{item.avatar}</div>
            <div className="mention-info">
              <div className="mention-name">{item.name}</div>
              <div className="mention-email">{item.email}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

MentionList.displayName = 'MentionList';

const TiptapDemo: React.FC = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return users
              .filter((user) =>
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component: ReactRenderer<MentionListRef>;
            let popup: HTMLElement;

            return {
              onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                popup = document.createElement('div');
                popup.className = 'mention-popup';
                popup.appendChild(component.element);
                document.body.appendChild(popup);

                // 定位弹出框
                const { selection } = props.editor.state;
                const { from } = selection;
                const start = props.editor.view.coordsAtPos(from);

                popup.style.position = 'absolute';
                popup.style.top = `${start.bottom + 5}px`;
                popup.style.left = `${start.left}px`;
                popup.style.zIndex = '1000';
              },

              onUpdate: (props: any) => {
                component.updateProps(props);

                // 更新位置
                const { selection } = props.editor.state;
                const { from } = selection;
                const start = props.editor.view.coordsAtPos(from);

                popup.style.top = `${start.bottom + 5}px`;
                popup.style.left = `${start.left}px`;
              },

              onKeyDown: (props: any) => {
                if (props.event.key === 'Escape') {
                  if (popup && popup.parentNode) {
                    document.body.removeChild(popup);
                  }
                  return true;
                }

                return (component.ref as MentionListRef)?.onKeyDown(props) || false;
              },

              onExit: () => {
                if (popup && popup.parentNode) {
                  document.body.removeChild(popup);
                }
                component.destroy();
              },
            };
          },
        },
      }),
    ],
    content: `
      <p>Hello! Try typing @ to mention someone:</p>
      <p>You can mention users like <span data-type="mention" data-id="1" data-label="Alice Johnson" class="mention">@Alice Johnson</span> by typing @ followed by their name.</p>
      <p>Start typing @ and see the suggestion list appear!</p>
    `,
  });

  const clearContent = () => {
    editor?.commands.clearContent();
  };

  const addSampleMention = () => {
    const sampleUser = users[Math.floor(Math.random() * users.length)];
    editor
      ?.chain()
      .focus()
      .insertContent(`<span data-type="mention" data-id="${sampleUser.id}" data-label="${sampleUser.name}" class="mention">@${sampleUser.name}</span> `)
      .run();
  };

  const getHTML = () => {
    if (editor) {
      console.log('HTML:', editor.getHTML());
      alert(`HTML content copied to console!\n\nPreview:\n${editor.getHTML()}`);
    }
  };

  const getJSON = () => {
    if (editor) {
      console.log('JSON:', editor.getJSON());
      alert(`JSON content copied to console!\n\nPreview:\n${JSON.stringify(editor.getJSON(), null, 2)}`);
    }
  };

  const getText = () => {
    if (editor) {
      const text = editor.getText();
      console.log('Plain Text:', text);
      alert(`Plain text content:\n\n${text}`);
    }
  };

  const getMentions = () => {
    if (editor) {
      const doc = editor.getJSON();
      const mentions: Array<{ id: number, name: string }> = [];

      // 递归查找所有 mention 节点
      const findMentions = (node: any) => {
        if (node.type === 'mention') {
          mentions.push({
            id: node.attrs.id,
            name: node.attrs.label
          });
        }
        if (node.content) {
          node.content.forEach(findMentions);
        }
      };

      if (doc.content) {
        doc.content.forEach(findMentions);
      }

      console.log('Extracted mentions:', mentions);
      alert(`Found ${mentions.length} mentions:\n\n${mentions.map(m => `@${m.name} (ID: ${m.id})`).join('\n')}`);
    }
  };

  const getTextWithMentions = () => {
    if (editor) {
      const doc = editor.getJSON();
      let result = '';

      // 递归处理节点，将 mention 转换为特定格式
      const processNode = (node: any): string => {
        if (node.type === 'mention') {
          return `@${node.attrs.label}`;
        }

        if (node.type === 'text') {
          return node.text || '';
        }

        if (node.content) {
          return node.content.map(processNode).join('');
        }

        return '';
      };

      if (doc.content) {
        result = doc.content.map((node: any) => {
          if (node.type === 'paragraph') {
            const text = node.content ? node.content.map(processNode).join('') : '';
            return text;
          }
          return processNode(node);
        }).join('\n');
      }

      console.log('Text with mentions:', result);
      alert(`Text with @mentions:\n\n${result}`);
    }
  };

  return (
    <div className="tiptap-demo">
      <div className="demo-header">
        <h1>🗣️ Tiptap Mentions Demo</h1>
        <p>An advanced rich text editor with @mention functionality</p>
      </div>

      <div className="demo-controls">
        <button onClick={clearContent} className="btn btn-secondary">
          🗑️ Clear Content
        </button>
        <button onClick={addSampleMention} className="btn btn-primary">
          ➕ Add Random Mention
        </button>
        <button onClick={getText} className="btn btn-success">
          📝 Get Text
        </button>
        <button onClick={getTextWithMentions} className="btn btn-success">
          🔗 Get Text + Mentions
        </button>
        <button onClick={getMentions} className="btn btn-warning">
          👥 Extract Mentions
        </button>
        <button onClick={getHTML} className="btn btn-info">
          📄 Get HTML
        </button>
        <button onClick={getJSON} className="btn btn-info">
          📋 Get JSON
        </button>
      </div>

      <div className="editor-container">
        <div className="editor-wrapper">
          <EditorContent editor={editor} className="editor-content" />
        </div>
      </div>

      <div className="demo-info">
        <h3>✨ Features:</h3>
        <ul>
          <li>Type <code>@</code> to trigger user mentions</li>
          <li>Search users by name or email</li>
          <li>Navigate with arrow keys</li>
          <li>Select with Enter or mouse click</li>
          <li>Beautiful popup with user avatars</li>
          <li>Fully accessible and keyboard-friendly</li>
        </ul>

        <h3>🎯 Available Users:</h3>
        <div className="users-grid">
          {users.map((user) => (
            <div key={user.id} className="user-card">
              <span className="user-avatar">{user.avatar}</span>
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TiptapDemo; 