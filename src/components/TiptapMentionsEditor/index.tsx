import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import MentionList from './MentionList';
import styles from './index.module.scss';

// 用户数据类型
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

// 提及数据类型
export interface MentionData {
  id: number;
  name: string;
}

// 内容提取结果类型
export interface ExtractedContent {
  text: string;
  html: string;
  json: any;
  textWithMentions: string;
  mentions: MentionData[];
}

// 组件 Props
interface TiptapMentionsEditorProps {
  users?: User[];
  placeholder?: string;
  initialContent?: string;
  onChange?: (content: ExtractedContent) => void;
  className?: string;
  disabled?: boolean;
}

// 组件 Ref 方法
export interface TiptapMentionsEditorRef {
  getContent: () => ExtractedContent;
  setContent: (content: string) => void;
  clearContent: () => void;
  focus: () => void;
  blur: () => void;
  insertMention: (user: User) => void;
}

// 默认用户数据
const defaultUsers: User[] = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', avatar: '👩‍💼' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', avatar: '👨‍💻' },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', avatar: '👩‍🎨' },
  { id: 4, name: 'David Wilson', email: 'david@example.com', avatar: '👨‍🔬' },
  { id: 5, name: 'Eve Brown', email: 'eve@example.com', avatar: '👩‍🚀' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', avatar: '👨‍🎭' },
  { id: 7, name: 'Grace Lee', email: 'grace@example.com', avatar: '👩‍⚕️' },
  { id: 8, name: 'Henry Taylor', email: 'henry@example.com', avatar: '👨‍🏫' },
];

const TiptapMentionsEditor = forwardRef<TiptapMentionsEditorRef, TiptapMentionsEditorProps>(
  ({ users = defaultUsers, placeholder = 'Type @ to mention someone...', initialContent = '', onChange, className, disabled = false }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: styles.mention,
          },
          suggestion: {
            items: ({ query }) => {
              return users
                .filter(user =>
                  user.name.toLowerCase().includes(query.toLowerCase()) ||
                  user.email.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5);
            },
            render: () => {
              let component: ReactRenderer;
              let popup: any;

              return {
                onStart: (props) => {
                  component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                  });

                  if (!props.clientRect) {
                    return;
                  }

                  popup = tippy(document.body, {
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                  });
                },
                onUpdate(props) {
                  component.updateProps(props);

                  if (!props.clientRect) {
                    return;
                  }

                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                  });
                },
                onKeyDown(props) {
                  if (props.event.key === 'Escape') {
                    popup[0].hide();
                    return true;
                  }

                  return (component.ref as any)?.onKeyDown(props);
                },
                onExit() {
                  popup[0].destroy();
                  component.destroy();
                },
              };
            },
          },
        }),
      ],
      content: initialContent,
      editable: !disabled,
      onUpdate: ({ editor }) => {
        if (onChange) {
          const content = extractContent(editor);
          onChange(content);
        }
      },
    });

    // 提取内容的通用方法
    const extractContent = (editorInstance: any): ExtractedContent => {
      const text = editorInstance.getText();
      const html = editorInstance.getHTML();
      const json = editorInstance.getJSON();

      // 提取带 mentions 的文本
      const textWithMentions = extractTextWithMentions(json);

      // 提取 mentions 列表
      const mentions = extractMentions(json);

      return {
        text,
        html,
        json,
        textWithMentions,
        mentions,
      };
    };

    // 提取带 mentions 的文本
    const extractTextWithMentions = (doc: any): string => {
      let result = '';

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

      return result;
    };

    // 提取 mentions 列表
    const extractMentions = (doc: any): MentionData[] => {
      const mentions: MentionData[] = [];

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

      return mentions;
    };

    // 暴露给父组件的方法
    useImperativeHandle(ref, () => ({
      getContent: () => {
        if (!editor) return { text: '', html: '', json: null, textWithMentions: '', mentions: [] };
        return extractContent(editor);
      },
      setContent: (content: string) => {
        if (editor) {
          editor.commands.setContent(content);
        }
      },
      clearContent: () => {
        if (editor) {
          editor.commands.clearContent();
        }
      },
      focus: () => {
        if (editor) {
          editor.commands.focus();
        }
      },
      blur: () => {
        if (editor) {
          editor.commands.blur();
        }
      },
      insertMention: (user: User) => {
        if (editor) {
          editor.chain().focus().insertContent(`@${user.name} `).run();
        }
      },
    }));

    useEffect(() => {
      return () => {
        if (editor) {
          editor.destroy();
        }
      };
    }, [editor]);

    return (
      <div className={`${styles.editorContainer} ${className || ''}`}>
        <EditorContent
          editor={editor}
          className={styles.editorContent}
          placeholder={placeholder}
        />
      </div>
    );
  }
);

TiptapMentionsEditor.displayName = 'TiptapMentionsEditor';

export default TiptapMentionsEditor; 