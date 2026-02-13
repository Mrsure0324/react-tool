import type { FigmaNode } from '@/services/figma.service';

export interface GeneratedComponent {
  name: string;
  code: string;
  imports: string[];
}

/**
 * 将 Figma 节点转换为 React 代码
 */
export class FigmaToCodeGenerator {
  private componentCounter = 0;
  private generatedComponents: Map<string, GeneratedComponent> = new Map();

  /**
   * 生成组件代码
   */
  generateComponent(node: FigmaNode, componentName?: string): GeneratedComponent {
    const name = componentName || this.generateComponentName(node.name);
    const imports = new Set<string>(['React']);
    const jsx = this.nodeToJSX(node, imports, 0);

    const code = this.buildComponentCode(name, jsx, Array.from(imports));

    const component: GeneratedComponent = {
      name,
      code,
      imports: Array.from(imports),
    };

    this.generatedComponents.set(name, component);
    return component;
  }

  /**
   * 将节点转换为 JSX
   */
  private nodeToJSX(node: FigmaNode, imports: Set<string>, depth: number): string {
    const indent = '  '.repeat(depth + 1);

    switch (node.type) {
      case 'FRAME':
      case 'GROUP':
      case 'COMPONENT':
      case 'INSTANCE':
        return this.generateContainer(node, imports, depth);

      case 'TEXT':
        return this.generateText(node, imports, depth);

      case 'RECTANGLE':
      case 'ELLIPSE':
      case 'VECTOR':
        return this.generateShape(node, imports, depth);

      case 'BOOLEAN_OPERATION':
        return this.generateShape(node, imports, depth);

      default:
        // 未知类型，生成一个 div
        if (node.children && node.children.length > 0) {
          return this.generateContainer(node, imports, depth);
        }
        return `${indent}<div className="unknown-type">{/* ${node.type} */}</div>`;
    }
  }

  /**
   * 生成容器组件
   */
  private generateContainer(node: FigmaNode, imports: Set<string>, depth: number): string {
    const indent = '  '.repeat(depth + 1);
    const styles = this.extractStyles(node);
    const className = this.generateClassName(node);

    let jsx = `${indent}<div className="${className}" style={${JSON.stringify(styles)}}>\n`;

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        jsx += this.nodeToJSX(child, imports, depth + 1) + '\n';
      }
    }

    jsx += `${indent}</div>`;
    return jsx;
  }

  /**
   * 生成文本组件
   */
  private generateText(node: FigmaNode, imports: Set<string>, depth: number): string {
    const indent = '  '.repeat(depth + 1);
    const styles = this.extractStyles(node);
    const className = this.generateClassName(node);
    const text = node.characters || 'Text';

    return `${indent}<span className="${className}" style={${JSON.stringify(styles)}}>${text}</span>`;
  }

  /**
   * 生成形状组件
   */
  private generateShape(node: FigmaNode, imports: Set<string>, depth: number): string {
    const indent = '  '.repeat(depth + 1);
    const styles = this.extractStyles(node);
    const className = this.generateClassName(node);

    // 如果是圆形，使用特殊样式
    if (node.type === 'ELLIPSE') {
      styles.borderRadius = '50%';
    }

    return `${indent}<div className="${className}" style={${JSON.stringify(styles)}} />`;
  }

  /**
   * 提取样式
   */
  private extractStyles(node: FigmaNode): React.CSSProperties {
    const styles: React.CSSProperties = {};

    // 尺寸
    if (node.absoluteBoundingBox) {
      styles.width = node.absoluteBoundingBox.width;
      styles.height = node.absoluteBoundingBox.height;
    }

    // 背景色
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const { r, g, b } = fill.color;
        const a = fill.opacity !== undefined ? fill.opacity : 1;
        styles.backgroundColor = `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
    }

    // 边框
    if (node.strokes && node.strokes.length > 0) {
      const stroke = node.strokes[0];
      if (stroke.type === 'SOLID' && stroke.color) {
        const { r, g, b } = stroke.color;
        const a = stroke.opacity !== undefined ? stroke.opacity : 1;
        styles.border = `1px solid rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
    }

    // 圆角
    if (node.cornerRadius) {
      styles.borderRadius = node.cornerRadius;
    }

    // 布局（Flexbox）
    if (node.layoutMode) {
      styles.display = 'flex';
      styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';

      // 间距
      if (node.itemSpacing) {
        styles.gap = node.itemSpacing;
      }

      // 内边距
      if (node.paddingLeft) styles.paddingLeft = node.paddingLeft;
      if (node.paddingRight) styles.paddingRight = node.paddingRight;
      if (node.paddingTop) styles.paddingTop = node.paddingTop;
      if (node.paddingBottom) styles.paddingBottom = node.paddingBottom;
    }

    // 文本样式
    if (node.style) {
      if (node.style.fontSize) styles.fontSize = node.style.fontSize;
      if (node.style.fontWeight) styles.fontWeight = node.style.fontWeight;
      if (node.style.fontFamily) styles.fontFamily = node.style.fontFamily;
      if (node.style.textAlignHorizontal) {
        styles.textAlign = node.style.textAlignHorizontal.toLowerCase();
      }
      if (node.style.lineHeightPx) styles.lineHeight = `${node.style.lineHeightPx}px`;
    }

    return styles;
  }

  /**
   * 生成类名
   */
  private generateClassName(node: FigmaNode): string {
    return node.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 生成组件名
   */
  private generateComponentName(nodeName: string): string {
    // 将名称转换为 PascalCase
    const name = nodeName
      .split(/[^a-zA-Z0-9]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    return name || `Component${++this.componentCounter}`;
  }

  /**
   * 构建完整的组件代码
   */
  private buildComponentCode(name: string, jsx: string, imports: string[]): string {
    const importStatements = imports
      .filter((imp) => imp !== 'React')
      .map((imp) => `import ${imp} from '${this.getImportPath(imp)}';`)
      .join('\n');

    return `import React from 'react';
${importStatements ? importStatements + '\n' : ''}
export interface ${name}Props {
  className?: string;
  style?: React.CSSProperties;
}

export const ${name}: React.FC<${name}Props> = ({ className, style }) => {
  return (
${jsx}
  );
};

export default ${name};
`;
  }

  /**
   * 获取导入路径
   */
  private getImportPath(importName: string): string {
    // 根据导入名称返回对应的路径
    const importMap: Record<string, string> = {
      Button: 'antd',
      Input: 'antd',
      Card: 'antd',
      Space: 'antd',
      Row: 'antd',
      Col: 'antd',
    };

    return importMap[importName] || importName;
  }

  /**
   * 获取所有生成的组件
   */
  getGeneratedComponents(): GeneratedComponent[] {
    return Array.from(this.generatedComponents.values());
  }

  /**
   * 重置生成器
   */
  reset(): void {
    this.componentCounter = 0;
    this.generatedComponents.clear();
  }
}
