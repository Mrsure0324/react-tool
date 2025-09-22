import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 代码高亮样式

interface MarkdownRendererProps {
  content: string;
  containerStyle?: React.CSSProperties;
}

const defaultComponents = {
  // 自定义组件样式
  h1: ({ children }: any) => (
    <h1 style={{ color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '8px' }}>
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 style={{ color: '#722ed1', borderBottom: '1px solid #722ed1', paddingBottom: '4px' }}>
      {children}
    </h2>
  ),
  blockquote: ({ children }: any) => (
    <blockquote style={{
      borderLeft: '4px solid #1890ff',
      paddingLeft: '16px',
      margin: '16px 0',
      backgroundColor: '#f6ffff',
      padding: '8px 16px'
    }}>
      {children}
    </blockquote>
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    return inline ? (
      <code style={{
        backgroundColor: '#f5f5f5',
        padding: '2px 4px',
        borderRadius: '3px',
        fontSize: '0.9em'
      }}>
        {children}
      </code>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  },
  table: ({ children }: any) => (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      margin: '16px 0'
    }}>
      {children}
    </table>
  ),
  th: ({ children }: any) => (
    <th style={{
      border: '1px solid #ddd',
      padding: '8px',
      backgroundColor: '#f5f5f5',
      textAlign: 'left'
    }}>
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td style={{
      border: '1px solid #ddd',
      padding: '8px'
    }}>
      {children}
    </td>
  )
};

const defaultContainerStyle: React.CSSProperties = {
  minHeight: '300px',
  padding: '16px',
  border: '1px solid #f0f0f0',
  borderRadius: '6px',
  backgroundColor: '#fafafa'
};

export default function MarkdownRenderer({
  content,
  containerStyle
}: MarkdownRendererProps) {
  return (
    <div style={{ ...defaultContainerStyle, ...containerStyle }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={defaultComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 