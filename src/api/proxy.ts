import { Request, Response } from 'express';
import axios from 'axios';

export default async function handler(req: Request, res: Response) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: '缺少URL参数' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      responseType: 'text',
    });

    // 设置响应头
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(response.data);
  } catch (error) {
    console.error('代理请求失败:', error);
    return res.status(500).json({ error: '获取内容失败' });
  }
} 