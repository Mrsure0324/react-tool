import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import styles from './index.less';
import { postMessageToHtmlEditor } from './utils/htmlEditor';
import HtmlEditorDebugger from './components/RightContent/HtmlEditorDebugger';

const HtmlEditor: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const loadHtml = async () => {
      try {
        // 使用绝对路径从public目录加载
        const response = await fetch('http://192.168.212.194:8000/mock/html/movie.html');
        const html = await response.text();
        if (iframeRef.current) {
          const iframe = iframeRef.current;
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
          }
        }
      } catch (error) {
        console.error('加载HTML失败:', error);
      }
    };

    loadHtml();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <Card className={styles.card}>
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            title="HTML预览"
            sandbox="allow-same-origin allow-scripts"
          />
        </Card>
      </div>
      <div className={styles.rightPanel}>
        {/* 右侧内容区域 */}
        <HtmlEditorDebugger iframeRef={iframeRef} />
      </div>
    </div>
  );
};

export default HtmlEditor;
