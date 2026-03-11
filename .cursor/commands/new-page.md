---
description: 新建页面，生成页面脚手架并注册路由
---

# 新建页面

请为以下页面生成脚手架：

{{input}}

## 生成内容

### 1. 页面文件

```
src/pages/{PageName}/
├── index.tsx        ← 页面组件
└── index.less       ← 页面样式
```

页面组件模板：

```typescript
import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';

const {PageName}Page: React.FC = () => {
  return (
    <PageContainer ghost>
      <div className={styles.container}>
        {/* TODO: 页面内容 */}
      </div>
    </PageContainer>
  );
};

export default {PageName}Page;
```

### 2. 注册路由

在 `.umirc.ts` 的 `routes` 数组中追加：

```typescript
{
  name: '{页面中文名}',
  path: '/{kebab-case-path}',
  component: './{PageName}',
},
```

### 3. 可选生成

根据用户需求判断是否需要额外生成：
- `src/pages/{PageName}/components/` — 页面私有组件
- `src/pages/{PageName}/types.ts` — 页面类型定义
- `src/services/{serviceName}.ts` — API 封装
- `src/models/{modelName}.ts` — Umi 全局模型

## 执行后确认

- [ ] 页面文件已创建
- [ ] 路由已在 `.umirc.ts` 注册
- [ ] `pnpm dev` 可以正常访问新页面
