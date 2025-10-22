# useJsonPatch Hook

一个强大且易用的 React Hook，用于处理 JSON Patch 操作（RFC 6902）。

## 特性

- ✅ 支持所有标准 JSON Patch 操作（add、remove、replace、move、copy、test）
- ✅ 额外的字符串追加操作
- ✅ 撤销/重做功能
- ✅ 操作历史记录
- ✅ 数据验证
- ✅ 错误处理
- ✅ TypeScript 支持
- ✅ 批量操作
- ✅ 便捷的操作方法

## 安装

确保项目中已安装 `fast-json-patch`：

```bash
npm install fast-json-patch
npm install @types/fast-json-patch --save-dev
```

## 基本用法

```tsx
import React from 'react';
import { useJsonPatch } from './hooks/useJsonPatch';

const MyComponent = () => {
  const jsonPatch = useJsonPatch({
    initialData: {
      name: 'John',
      age: 30,
      hobbies: ['reading']
    },
    onError: (error) => console.error('操作失败:', error.message),
    onSuccess: (operation, result) => console.log('操作成功:', operation)
  });

  const handleUpdateName = async () => {
    await jsonPatch.replace('/name', 'Jane');
  };

  const handleAddHobby = async () => {
    const hobbies = jsonPatch.getValueByPath('/hobbies') || [];
    await jsonPatch.replace('/hobbies', [...hobbies, 'gaming']);
  };

  return (
    <div>
      <pre>{JSON.stringify(jsonPatch.data, null, 2)}</pre>
      <button onClick={handleUpdateName}>更新姓名</button>
      <button onClick={handleAddHobby}>添加爱好</button>
      <button onClick={jsonPatch.undo} disabled={!jsonPatch.canUndo}>
        撤销
      </button>
      <button onClick={jsonPatch.redo} disabled={!jsonPatch.canRedo}>
        重做
      </button>
    </div>
  );
};
```

## API 参考

### 配置选项 (UseJsonPatchOptions)

```tsx
interface UseJsonPatchOptions {
  initialData?: any;              // 初始数据
  maxHistorySize?: number;        // 最大历史记录数量（默认：50）
  enableValidation?: boolean;     // 启用操作验证（默认：true）
  onError?: (error: JsonPatchError) => void;    // 错误回调
  onSuccess?: (operation: Operation, result: any) => void; // 成功回调
}
```

### 返回值 (UseJsonPatchReturn)

#### 状态属性

- `data: any` - 当前数据
- `originalData: any` - 原始数据
- `operations: Operation[]` - 已应用的操作列表
- `history: JsonPatchHistory[]` - 操作历史记录
- `canUndo: boolean` - 是否可以撤销
- `canRedo: boolean` - 是否可以重做

#### 操作方法

- `applyOperation(operation: JsonPatchOperation): Promise<boolean>` - 应用单个操作
- `applyPatch(patch: Operation[]): Promise<boolean>` - 应用补丁数组
- `undo(): boolean` - 撤销上一个操作
- `redo(): boolean` - 重做操作
- `reset(): void` - 重置到原始状态
- `setData(newData: any): void` - 设置新数据

#### 工具方法

- `generatePatch(from?, to?): Operation[]` - 生成补丁
- `validateOperation(operation): JsonPatchError | null` - 验证操作
- `getValueByPath(path: string): any` - 获取路径对应的值
- `pathExists(path: string): boolean` - 检查路径是否存在

#### 便捷操作

- `add(path: string, value: any): Promise<boolean>` - 添加值
- `addWithPath(path: string, value: any): Promise<boolean>` - 添加值（自动创建缺失的父路径）
- `remove(path: string): Promise<boolean>` - 删除值
- `replace(path: string, value: any): Promise<boolean>` - 替换值
- `move(from: string, to: string): Promise<boolean>` - 移动值
- `copy(from: string, to: string): Promise<boolean>` - 复制值
- `test(path: string, value: any): Promise<boolean>` - 测试值
- `append(path: string, text: string): Promise<boolean>` - 追加文本到字符串

## 操作示例

### 基本操作

```tsx
// 添加新属性
await jsonPatch.add('/newProperty', 'value');

// 添加属性（自动创建路径）- 解决 "OPERATION_PATH_CANNOT_ADD" 错误
await jsonPatch.addWithPath('/extra/nested/deep/value', 'Auto-created!');

// 删除属性
await jsonPatch.remove('/oldProperty');

// 替换值
await jsonPatch.replace('/name', 'New Name');

// 移动属性
await jsonPatch.move('/oldPath', '/newPath');

// 复制属性
await jsonPatch.copy('/source', '/destination');

// 测试值
await jsonPatch.test('/status', 'active');

// 追加文本
await jsonPatch.append('/description', ' - Updated');
```

### 数组操作

```tsx
// 添加数组元素
await jsonPatch.add('/items/0', 'new item');  // 在开头添加
await jsonPatch.add('/items/-', 'new item');  // 在末尾添加
await jsonPatch.add('/items/2', 'new item');  // 在指定位置添加

// 删除数组元素
await jsonPatch.remove('/items/0');  // 删除第一个元素
await jsonPatch.remove('/items/-');  // 删除最后一个元素
```

### 批量操作

```tsx
const patch = [
  { op: 'replace', path: '/name', value: 'New Name' },
  { op: 'add', path: '/email', value: 'email@example.com' },
  { op: 'remove', path: '/oldField' }
];

await jsonPatch.applyPatch(patch);
```

### 错误处理

```tsx
const jsonPatch = useJsonPatch({
  initialData: data,
  onError: (error) => {
    switch (error.code) {
      case 'INVALID_PATH':
        console.error('路径格式错误:', error.message);
        break;
      case 'VALIDATION_ERROR':
        console.error('验证失败:', error.message);
        break;
      case 'OPERATION_ERROR':
        console.error('操作执行失败:', error.message);
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
});
```

## 高级用法

### 自定义验证

```tsx
const jsonPatch = useJsonPatch({
  initialData: data,
  enableValidation: true,
  onError: (error) => {
    // 自定义错误处理逻辑
    if (error.code === 'VALIDATION_ERROR') {
      // 显示用户友好的错误消息
      showNotification('操作无效，请检查输入');
    }
  }
});
```

### 历史记录管理

```tsx
const jsonPatch = useJsonPatch({
  initialData: data,
  maxHistorySize: 100,  // 保留更多历史记录
});

// 获取历史记录
console.log('操作历史:', jsonPatch.history);

// 检查是否可以撤销/重做
if (jsonPatch.canUndo) {
  jsonPatch.undo();
}

if (jsonPatch.canRedo) {
  jsonPatch.redo();
}
```

### 生成补丁

```tsx
// 比较两个对象生成补丁
const originalData = { name: 'John', age: 30 };
const modifiedData = { name: 'Jane', age: 31 };

const patch = jsonPatch.generatePatch(originalData, modifiedData);
console.log('生成的补丁:', patch);

// 应用生成的补丁
await jsonPatch.applyPatch(patch);
```

## 类型定义

Hook 使用 TypeScript 编写，提供完整的类型支持。主要类型包括：

- `JsonPatchOperation` - 操作定义
- `JsonPatchHistory` - 历史记录
- `JsonPatchError` - 错误信息
- `UseJsonPatchOptions` - 配置选项
- `UseJsonPatchReturn` - 返回值类型

## 路径创建问题解决方案

### 问题描述

当使用标准的 `add` 操作时，如果路径中的父级对象不存在，会出现 `OPERATION_PATH_CANNOT_ADD` 错误：

```tsx
// 假设 data = { user: { name: 'John' } }
// 以下操作会失败，因为 'extra' 对象不存在
await jsonPatch.add('/extra/name', 'value'); // ❌ 错误: OPERATION_PATH_CANNOT_ADD
```

### 解决方案

使用 `addWithPath` 方法，它会自动创建缺失的父路径：

```tsx
// 使用 addWithPath 自动创建路径
await jsonPatch.addWithPath('/extra/name', 'value'); // ✅ 成功

// 结果: { user: { name: 'John' }, extra: { name: 'value' } }

// 支持深层嵌套
await jsonPatch.addWithPath('/extra/nested/deep/value', 123);
// 结果: { user: { name: 'John' }, extra: { name: 'value', nested: { deep: { value: 123 } } } }

// 自动识别数组
await jsonPatch.addWithPath('/extra/items/0', 'first item');
// 结果: { ..., extra: { ..., items: ['first item'] } }
```

### 两种方法的区别

| 方法 | 行为 | 适用场景 |
|------|------|----------|
| `add()` | 严格遵循 JSON Patch 规范，父路径必须存在 | 标准的 JSON Patch 操作 |
| `addWithPath()` | 自动创建缺失的父路径 | 需要动态创建嵌套结构时 |

## 注意事项

1. **路径格式**: 所有路径必须以 `/` 开头，遵循 JSON Pointer 规范
2. **数据不可变性**: Hook 内部会自动处理数据的不可变更新
3. **异步操作**: 所有修改操作都是异步的，返回 Promise
4. **错误处理**: 建议总是提供 `onError` 回调来处理错误
5. **性能考虑**: 大型数据结构可能影响性能，考虑适当的 `maxHistorySize`
6. **路径创建**: 使用 `addWithPath` 时会自动创建对象或数组，根据下一级路径判断类型

## 示例项目

查看 `src/examples/JsonPatchExample.tsx` 获取完整的使用示例。
