/**
 * Figma 配置管理
 */

const FIGMA_API_KEY_STORAGE = 'figma_api_key';

export class FigmaConfig {
  /**
   * 保存 API Key 到本地存储
   */
  static saveApiKey(apiKey: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FIGMA_API_KEY_STORAGE, apiKey);
    }
  }

  /**
   * 从本地存储获取 API Key
   */
  static getApiKey(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(FIGMA_API_KEY_STORAGE);
    }
    return null;
  }

  /**
   * 清除 API Key
   */
  static clearApiKey(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FIGMA_API_KEY_STORAGE);
    }
  }

  /**
   * 验证 API Key 格式
   */
  static validateApiKey(apiKey: string): boolean {
    // Figma API Key 通常是 40-50 个字符的字符串
    return apiKey.length >= 20 && /^[a-zA-Z0-9-_]+$/.test(apiKey);
  }
}
