import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, message, Spin } from 'antd';
import styles from './index.less';

const HtmlImageGenerator: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 模拟滚动以触发懒加载和动画
  const simulateScroll = async (document: Document) => {
    const maxScroll = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0
    );
    
    const step = window.innerHeight;
    let currentScroll = 0;

    while (currentScroll <= maxScroll) {
      document.documentElement.scrollTo(0, currentScroll);
      if (document.body) {
        document.body.scrollTo(0, currentScroll);
      }
      currentScroll += step;
      // 等待一小段时间让内容加载
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 最后滚动回顶部
    document.documentElement.scrollTo(0, 0);
    if (document.body) {
      document.body.scrollTo(0, 0);
    }
  };

  // 预处理iframe内容
  const preprocessIframeContent = async () => {
    if (!iframeRef.current?.contentDocument) return;
    
    const doc = iframeRef.current.contentDocument;

    // 禁用所有视频自动播放
    doc.querySelectorAll('video').forEach(video => {
      video.autoplay = false;
      video.pause();
    });

    // 移除可能影响截图的固定定位元素
    const styleSheet = doc.createElement('style');
    styleSheet.textContent = `
      *[style*="position: fixed"],
      *[style*="position:fixed"] {
        position: absolute !important;
      }
      body {
        overflow: visible !important;
        height: auto !important;
        transform: none !important;
      }
      html {
        overflow: visible !important;
        height: auto !important;
        transform: none !important;
      }
    `;
    doc.head.appendChild(styleSheet);

    // 模拟滚动以触发懒加载
    await simulateScroll(doc);

    // 等待一段时间确保动画和过渡效果完成
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // 处理HTML内容中的相对路径
  const processHtml = (html: string, baseUrl: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 处理图片路径
    doc.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.startsWith('http')) {
        img.src = new URL(img.src, baseUrl).href;
      }
    });

    // 处理CSS文件路径
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const linkElement = link as HTMLLinkElement;
      if (linkElement.href && !linkElement.href.startsWith('http')) {
        linkElement.href = new URL(linkElement.href, baseUrl).href;
      }
    });

    // 处理JavaScript文件路径
    doc.querySelectorAll('script').forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (scriptElement.src && !scriptElement.src.startsWith('http')) {
        scriptElement.src = new URL(scriptElement.src, baseUrl).href;
      }
    });

    // 处理图标路径
    doc.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]').forEach(link => {
      const linkElement = link as HTMLLinkElement;
      if (linkElement.href && !linkElement.href.startsWith('http')) {
        linkElement.href = new URL(linkElement.href, baseUrl).href;
      }
    });

    return doc.documentElement.outerHTML;
  };

  const handleCapture = async () => {
    if (!url) {
      message.error('请输入网页URL');
      return;
    }

    setLoading(true);
    try {
      // 1. 通过代理获取网页内容
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('获取网页内容失败');
      }
      const html = await response.text();
      
      // 处理HTML内容中的相对路径
      const processedHtml = processHtml(html, url);
      setContent(processedHtml);

      // 2. 等待内容渲染并预处理
      await new Promise(resolve => setTimeout(resolve, 2000));
      await preprocessIframeContent();

      // 3. 生成截图
      const html2canvas = (await import('html2canvas')).default;
      
      if (!iframeRef.current) {
        throw new Error('未找到目标元素');
      }

      const iframeDocument = iframeRef.current.contentDocument;
      if (!iframeDocument || !iframeDocument.body) {
        throw new Error('无法访问iframe内容');
      }

      // 设置iframe的样式以确保完整捕获
      const originalStyle = iframeDocument.body.style.cssText;
      iframeDocument.body.style.cssText = `
        margin: 0;
        overflow: visible !important;
        width: ${iframeDocument.documentElement.scrollWidth}px !important;
        min-height: ${iframeDocument.documentElement.scrollHeight}px !important;
        transform: none !important;
      `;

      const canvas = await html2canvas(iframeDocument.body, {
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        scrollX: 0,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: true,
        width: iframeDocument.documentElement.scrollWidth,
        height: iframeDocument.documentElement.scrollHeight,
        windowWidth: iframeDocument.documentElement.scrollWidth,
        windowHeight: iframeDocument.documentElement.scrollHeight,
        onclone: (doc) => {
          // 处理克隆的文档
          doc.querySelectorAll('img').forEach(img => {
            img.crossOrigin = 'anonymous';
          });
          // 确保所有元素都可见
          doc.querySelectorAll('*').forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
              (el as HTMLElement).style.display = 'block';
              (el as HTMLElement).style.visibility = 'visible';
            }
          });
          return doc;
        }
      });

      // 恢复原始样式
      iframeDocument.body.style.cssText = originalStyle;

      // 4. 下载图片
      const link = document.createElement('a');
      link.download = `webpage-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 0.8);
      link.click();

      message.success('长图生成成功！');
    } catch (error) {
      console.error('生成长图失败:', error);
      message.error('生成长图失败，请检查URL是否正确');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (content && iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  }, [content]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Input 
          placeholder="请输入网页URL" 
          value={url}
          onChange={e => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button 
          type="primary"
          onClick={handleCapture}
          loading={loading}
        >
          生成长图
        </Button>
      </div>

      <div className={styles.content}>
        <iframe
          ref={iframeRef}
          className={styles.preview}
          sandbox="allow-same-origin allow-scripts"
          style={{ 
            width: '100%', 
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default HtmlImageGenerator; 