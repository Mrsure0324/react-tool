# SSE JSON Patch 调试工具

这是一个专门用于调试和可视化SSE（Server-Sent Events）事件流中JSON Patch操作的工具。

## 功能特性

### 核心功能
- 📥 **SSE事件流解析**：自动解析SSE格式的事件流数据
- 🔍 **Delta事件提取**：智能提取包含JSON Patch操作的delta事件
- ⏯️ **可视化播放**：按时间节奏逐步应用JSON Patch操作
- 📊 **实时数据展示**：实时展示JSON数据的变化过程

### JSON Patch 操作支持
- ✅ `add` - 添加新字段或值
- ✅ `append` - 追加字符串内容
- ✅ `replace` - 替换现有值
- ✅ `remove` - 删除字段

## 使用方法

### 1. 访问页面
在浏览器中访问：`http://localhost:8000/SSEJsonPatchPlayground`

### 2. 输入SSE事件流
有两种方式输入数据：

#### 方式一：加载示例数据
点击 **"📋 加载示例数据"** 按钮，会自动加载预设的SSE事件流示例。

#### 方式二：手动输入
在文本框中粘贴SSE事件流数据，格式如下：

```
event:message
data:{"content":"hello world"}

event:delta
data:{"patch":[{"op":"add","path":"/name","value":"test"}],"eventIndex":1}

event:delta
data:{"patch":[{"op":"append","path":"/name","value":" user"}],"eventIndex":2}
```

### 3. 解析事件流
点击 **"🔍 解析事件流"** 按钮，工具会自动：
- 解析所有SSE事件
- 提取delta事件
- 统计事件数量

### 4. 播放控制

#### 播放速度设置
- 在"播放速度"输入框中设置每步操作的间隔时间（单位：毫秒）
- 默认值：1000ms（1秒）
- 最小值：100ms

#### 控制按钮
- **🔄 重置**：清空当前数据，返回初始状态
- **⏮ 上一步**：回退到上一个delta事件状态
- **▶️ 播放**：自动按节奏逐步应用所有操作
- **⏸ 暂停**：暂停自动播放
- **⏭ 下一步**：手动前进到下一个delta事件

### 5. 查看结果

#### 当前数据状态
右侧面板实时展示JSON数据的当前状态。

#### 当前操作详情
显示当前正在应用的JSON Patch操作详情。

#### Delta事件列表
左侧列表显示所有delta事件：
- ✅ 已完成的事件显示为灰色
- 🔵 当前正在执行的事件高亮显示
- 每个事件显示包含的操作类型和路径

## SSE事件流格式说明

### 事件格式
```
event:<事件类型>
data:<JSON数据>

```

### Delta事件数据结构
```json
{
  "patch": [
    {
      "op": "add",           // 操作类型
      "path": "/path/to/field",  // JSON Pointer路径
      "value": "value"       // 要设置的值
    }
  ],
  "eventIndex": 1           // 事件索引（可选）
}
```

### JSON Patch操作示例

#### Add 操作
```json
{
  "op": "add",
  "path": "/user/name",
  "value": "张三"
}
```

#### Append 操作
```json
{
  "op": "append",
  "path": "/message/content",
  "value": " 追加的文本"
}
```

#### Replace 操作
```json
{
  "op": "replace",
  "path": "/user/age",
  "value": 25
}
```

#### Remove 操作
```json
{
  "op": "remove",
  "path": "/user/tempField"
}
```

## 应用场景

1. **调试SSE实时推送**
   - 调试服务端推送的SSE事件流
   - 验证JSON Patch操作的正确性

2. **可视化数据变化**
   - 理解JSON数据的渐进式构建过程
   - 追踪数据变化的每一步

3. **开发辅助**
   - 测试JSON Patch操作序列
   - 模拟服务端推送场景

## 技术细节

### 路径自动创建
工具会自动创建不存在的路径：
- 对象字段：自动创建父对象
- 数组元素：自动创建父数组

### 错误处理
- 解析错误会在页面上显示错误信息
- 操作失败会记录在控制台，但不影响后续操作

### 性能优化
- 使用深拷贝确保数据不可变性
- 渐进式渲染，避免大数据量卡顿

## 示例数据说明

内置的示例数据展示了一个完整的SSE事件流场景：
1. 普通消息事件（message）
2. 创建初始数据结构（add）
3. 添加嵌套字段（add）
4. 追加字符串内容（append）

这个示例涵盖了实际应用中最常见的使用场景。



