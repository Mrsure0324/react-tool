# Figma to Code 工作流

这是一个将 Figma 设计稿自动转换为 React 组件代码的工具。

## 功能特性

- ✅ 支持从 Figma 链接直接获取设计稿数据
- ✅ 自动解析 Figma 节点结构
- ✅ 生成符合项目规范的 React + TypeScript 代码
- ✅ 保留设计稿的样式（颜色、尺寸、布局等）
- ✅ 支持 Flexbox 布局转换
- ✅ 代码预览、复制和下载
- ✅ 本地存储 API Key

## 快速开始

### 1. 获取 Figma API Key

1. 登录 [Figma](https://www.figma.com/)
2. 点击右上角头像 → Settings
3. 在左侧菜单找到 "Personal Access Tokens"
4. 点击 "Generate new token"
5. 输入 Token 名称（如 "React Tool"）
6. 复制生成的 Token（只会显示一次）

### 2. 使用工具

1. 访问项目中的 `/figma-to-code` 页面
2. 输入你的 Figma API Key
3. 粘贴 Figma 设计稿链接
4. 点击"获取 Figma 数据"
5. 系统会自动生成 React 组件代码
6. 可以预览、复制或下载代码

### 3. Figma 链接格式

支持以下两种链接格式：

**整个文件：**
```
https://www.figma.com/file/{fileKey}/{title}
```

**特定节点（Frame/Component）：**
```
https://www.figma.com/file/{fileKey}/{title}?node-id={nodeId}
```

## 代码结构

```
src/
├── services/
│   └── figma.service.ts          # Figma API 服务
├── utils/
│   ├── figma-to-code.ts          # 代码生成器
│   └── figma-config.ts           # 配置管理
└── pages/
    └── FigmaToCode/
        ├── index.tsx             # 主页面组件
        └── index.less            # 样式文件
```

## API 说明

### FigmaService

Figma API 服务类，用于与 Figma API 交互。

```typescript
import { FigmaService } from '@/services/figma.service';

const service = new FigmaService('your-api-key');

// 获取文件
const file = await service.getFile('fileKey');

// 获取特定节点
const node = await service.getNode('fileKey', 'nodeId');

// 获取图片
const images = await service.getImages('fileKey', ['nodeId1', 'nodeId2']);

// 解析 Figma URL
const parsed = FigmaService.parseFigmaUrl('https://www.figma.com/file/...');
```

### FigmaToCodeGenerator

代码生成器类，将 Figma 节点转换为 React 代码。

```typescript
import { FigmaToCodeGenerator } from '@/utils/figma-to-code';

const generator = new FigmaToCodeGenerator();

// 生成组件
const component = generator.generateComponent(figmaNode, 'MyComponent');

console.log(component.name);    // 组件名称
console.log(component.code);    // 生成的代码
console.log(component.imports); // 需要的导入
```

### FigmaConfig

配置管理类，用于存储和管理 API Key。

```typescript
import { FigmaConfig } from '@/utils/figma-config';

// 保存 API Key
FigmaConfig.saveApiKey('your-api-key');

// 获取 API Key
const apiKey = FigmaConfig.getApiKey();

// 验证 API Key
const isValid = FigmaConfig.validateApiKey(apiKey);

// 清除 API Key
FigmaConfig.clearApiKey();
```

## 支持的 Figma 节点类型

| 节点类型 | 转换结果 | 说明 |
|---------|---------|------|
| FRAME | `<div>` | 容器，支持 Flexbox 布局 |
| GROUP | `<div>` | 分组容器 |
| COMPONENT | `<div>` | 组件容器 |
| INSTANCE | `<div>` | 组件实例 |
| TEXT | `<span>` | 文本元素 |
| RECTANGLE | `<div>` | 矩形 |
| ELLIPSE | `<div>` | 圆形（borderRadius: 50%） |
| VECTOR | `<div>` | 矢量图形 |

## 样式转换

工具会自动转换以下样式属性：

- ✅ 尺寸（width, height）
- ✅ 背景色（backgroundColor）
- ✅ 边框（border）
- ✅ 圆角（borderRadius）
- ✅ 布局（display, flexDirection, gap）
- ✅ 内边距（padding）
- ✅ 文本样式（fontSize, fontWeight, fontFamily, textAlign, lineHeight）

## 生成的代码示例

```tsx
import React from 'react';

export interface MyComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export const MyComponent: React.FC<MyComponentProps> = ({ className, style }) => {
  return (
    <div className="my-component" style={{"width":375,"height":812,"display":"flex","flexDirection":"column"}}>
      <div className="header" style={{"width":375,"height":64,"backgroundColor":"rgba(255, 255, 255, 1)"}}>
        <span className="title" style={{"fontSize":20,"fontWeight":600}}>Title</span>
      </div>
    </div>
  );
};

export default MyComponent;
```

## 注意事项

1. **API Key 安全**：API Key 存储在浏览器的 localStorage 中，请勿在公共设备上使用
2. **权限要求**：确保你的 Figma 账户有权限访问目标文件
3. **节点复杂度**：过于复杂的设计稿可能需要手动调整生成的代码
4. **样式精度**：某些复杂样式（如渐变、阴影）可能需要手动完善
5. **响应式设计**：生成的代码使用固定尺寸，需要手动添加响应式逻辑

## 最佳实践

1. **命名规范**：在 Figma 中使用清晰的命名，会生成更好的组件名和类名
2. **结构清晰**：使用 Frame 和 Group 组织设计稿结构
3. **使用 Auto Layout**：Figma 的 Auto Layout 会转换为 Flexbox
4. **组件化**：将可复用的部分创建为 Figma Component
5. **代码审查**：生成的代码建议人工审查和优化

## 扩展开发

### 添加自定义转换规则

在 `figma-to-code.ts` 中扩展 `nodeToJSX` 方法：

```typescript
private nodeToJSX(node: FigmaNode, imports: Set<string>, depth: number): string {
  switch (node.type) {
    case 'YOUR_CUSTOM_TYPE':
      return this.generateCustomComponent(node, imports, depth);
    // ...
  }
}
```

### 集成 UI 组件库

修改 `getImportPath` 方法来映射到你的组件库：

```typescript
private getImportPath(importName: string): string {
  const importMap: Record<string, string> = {
    Button: 'antd',
    CustomComponent: '@/components/CustomComponent',
    // 添加更多映射
  };
  return importMap[importName] || importName;
}
```

## 故障排除

### 问题：无法获取 Figma 数据

- 检查 API Key 是否正确
- 确认你有权限访问该文件
- 检查网络连接

### 问题：生成的代码样式不正确

- 确认 Figma 中的样式设置正确
- 检查是否使用了不支持的样式属性
- 手动调整生成的代码

### 问题：组件名称不符合预期

- 在 Figma 中重命名节点
- 使用 PascalCase 命名规范

## 技术栈

- React 18
- TypeScript
- Ant Design
- Figma API
- Umi Max

## 相关链接

- [Figma API 文档](https://www.figma.com/developers/api)
- [Figma Plugin 开发](https://www.figma.com/plugin-docs/)
- [React 文档](https://react.dev/)

## 更新日志

### v1.0.0 (2024-11-25)

- ✨ 初始版本发布
- ✨ 支持基础节点类型转换
- ✨ 支持样式提取和转换
- ✨ 支持代码预览和下载
