import axios from 'axios';

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  cornerRadius?: number;
  characters?: string;
  style?: any;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutAlign?: string;
  constraints?: any;
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

export class FigmaService {
  private apiKey: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 获取 Figma 文件数据
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    try {
      const response = await axios.get(`${this.baseUrl}/files/${fileKey}`, {
        headers: {
          'X-Figma-Token': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch Figma file:', error);
      throw error;
    }
  }

  /**
   * 获取特定节点
   */
  async getNode(fileKey: string, nodeId: string): Promise<FigmaNode> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/files/${fileKey}/nodes?ids=${nodeId}`,
        {
          headers: {
            'X-Figma-Token': this.apiKey,
          },
        },
      );
      return response.data.nodes[nodeId].document;
    } catch (error) {
      console.error('Failed to fetch Figma node:', error);
      throw error;
    }
  }

  /**
   * 获取图片导出链接
   */
  async getImages(
    fileKey: string,
    nodeIds: string[],
    format: 'png' | 'jpg' | 'svg' = 'png',
    scale: number = 2,
  ): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`${this.baseUrl}/images/${fileKey}`, {
        headers: {
          'X-Figma-Token': this.apiKey,
        },
        params: {
          ids: nodeIds.join(','),
          format,
          scale,
        },
      });
      return response.data.images;
    } catch (error) {
      console.error('Failed to fetch Figma images:', error);
      throw error;
    }
  }

  /**
   * 解析 Figma URL 获取 fileKey 和 nodeId
   */
  static parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
    // 支持格式：
    // https://www.figma.com/file/{fileKey}/{title}
    // https://www.figma.com/file/{fileKey}/{title}?node-id={nodeId}
    // https://www.figma.com/design/{fileKey}/{title}
    // https://www.figma.com/design/{fileKey}/{title}?node-id={nodeId}
    const fileMatch = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    const nodeMatch = url.match(/node-id=([^&]+)/);

    if (!fileMatch) {
      return null;
    }

    return {
      fileKey: fileMatch[1],
      nodeId: nodeMatch ? nodeMatch[1].replace(/-/g, ':') : undefined,
    };
  }
}
