import { Request, Response } from 'express';
import axios from 'axios';

export default {
  'GET /api/proxy': async (req: Request, res: Response) => {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: '请提供有效的URL' });
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        responseType: 'text',
        timeout: 10000,
      });

      // 处理响应
      let html = response.data;

      // 处理相对路径
      const baseUrl = new URL(url).origin;
      
      // 处理图片路径
      html = html.replace(/<img([^>]+)src=["'](?!http)([^"']+)["']/g, (match: string, attrs: string, src: string) => {
        const absoluteUrl = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
        return `<img${attrs}src="${absoluteUrl}" crossorigin="anonymous"`;
      });

      // 处理样式表路径
      html = html.replace(/<link([^>]+)href=["'](?!http)([^"']+)["']/g, (match: string, attrs: string, href: string) => {
        const absoluteUrl = href.startsWith('/') ? `${baseUrl}${href}` : `${baseUrl}/${href}`;
        return `<link${attrs}href="${absoluteUrl}"`;
      });

      // 设置响应头
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(html);
    } catch (error: any) {
      console.error('代理请求失败:', error.message);
      return res.status(500).json({ 
        error: '获取内容失败',
        message: error.message 
      });
    }
  },
  
  // 处理图片代理，解决跨域问题
  'GET /api/proxy-image': async (req: Request, res: Response) => {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: '缺少图片URL参数' });
    }
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
      });
      
      // 获取内容类型
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      // 设置响应头
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 缓存1天
      
      return res.send(response.data);
    } catch (error: any) {
      console.error('图片代理失败:', error.message);
      return res.status(500).json({ error: '获取图片失败' });
    }
  },
}; 