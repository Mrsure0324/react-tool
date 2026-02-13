# AI 上下文引导文件（Context Bootstrap）

> ⚠️ 本文件用于在新项目中恢复 AI 对话上下文。
> 使用方式：在新项目的 Cursor Chat 中输入 `@CONTEXT.md 我们继续` 即可接续。
> 生成时间：2026-02-09

---

## 一、项目背景

### 1.1 原始项目
- **项目名**: react-tool
- **路径**: `/Users/sure/Desktop/sure/react-tool`
- **技术栈**: Umi Max + React + Ant Design + TypeScript + SCSS/LESS
- **包管理**: pnpm
- **设计工具**: Pencil（Cursor IDE 插件，https://www.pencil.dev/）

### 1.2 我们要做什么
创建一个**新项目**，用来落地 **Pencil 设计稿 → React 代码** 的工程化协作体系，包括：
- `.cursor/rules/` — AI 行为规则（自动注入每次对话）
- `.cursor/skills/` — 标准化 Prompt 模板（团队共用）
- `scripts/` — 自动化工具脚本
- 完整的 Design-to-Code 开发流程

---

## 二、关于 Pencil 的关键认知

### 2.1 Pencil 是什么
- 一个**矢量设计工具**，直接集成在 Cursor IDE 中
- 使用 `.pen` 文件（JSON 格式）存储设计
- 核心理念：**Design as Code**（设计即代码）
- 支持 AI 集成（MCP 工具链），AI 可以直接读写 .pen 文件

### 2.2 关键限制
- **本地优先**：Pencil 只能读取本地 `.pen` 文件，不支持远程 URL 读取
- **协作方式**：通过 Git 同步，不是实时多人在线编辑（与 Figma 不同）
- `.pen` 文件是 JSON，可以 Git diff/merge

### 2.3 Pencil MCP 工具链
AI 通过以下 MCP 工具操作 .pen 文件：
- `batch_get` — 读取节点结构（搜索/按 ID 读取）
- `batch_design` — 设计操作（插入/更新/删除/复制/移动）
- `get_screenshot` — 截图验证
- `snapshot_layout` — 获取布局矩形
- `search_all_unique_properties` — 提取 Token（颜色/字号/间距等）
- `get_variables` / `set_variables` — 变量管理
- `get_guidelines` — 获取设计规范指南（topic: code/table/tailwind/landing-page/design-system）

### 2.4 重要：.pen 文件只能通过 Pencil MCP 工具读写
- ❌ 禁止用 `read_file` 或 `grep` 读取 .pen 文件内容
- ✅ 必须用 `batch_get` 等 Pencil MCP 工具

---

## 三、设计稿分析结论

### 3.1 组件集（组件.pen）

我们已经分析过一份完整的设计稿，包含以下 8 个组件：

| # | 组件名称 | .pen 节点 ID | 关键特征 |
|---|---------|-------------|---------|
| 1 | 顶部导航栏 | `pcfrJ` | 返回按钮 + 菜单按钮，毛玻璃效果，padding: [8,16] |
| 2 | 角色开场卡片（无视频） | `j6QaP` | 头像36px、名称、关注按钮、简介文案，圆角16px |
| 3 | 角色开场卡片（有视频） | `HBuA3` | 同上 + 视频缩略图60×80 + 播放按钮 |
| 4 | 用户气泡 | `6lJbO` | 紫色 #7259FF，圆角 [22,22,6,22]，padding: [12,16] |
| 5 | 角色说话气泡 | `nT8lY` | 半透明黑底 #00000080 + 毛玻璃43.75px，圆角 [6,22,22,22] |
| 6 | 用户头像 + 语音播放 | `5hJvo` | 头像30px + 声波图标 + 时长，语音按钮 #3a3a3abf 圆角16px |
| 7 | 底部输入框 | `iEfPU` | 渐变蒙层 + 输入框（圆角27px）+ 功能按钮组（添加/AI语音/AI图片/AI续写/发送） |
| 8 | 发送按钮（点亮/未点亮） | `ye1dL`/`48rIE` | 点亮时圆形背景 #FFEF00，未点亮时 #ffffff14 + opacity:0.3 |

### 3.2 页面组装（对话页.pen）
- 画布尺寸：402×874（手机屏）
- 布局方式：`layout: "none"`（绝对定位）
- 层叠顺序（从底到顶）：背景图 → 状态栏+导航栏 → 开场卡片 → 角色气泡 → 语音播放 → 用户头像 → 用户气泡 → 底部输入框

### 3.3 提取的 Design Token

**颜色系统**：
```
主色:         #7259FF (用户气泡)
背景深色:     #1E1E1E (输入框底部)
毛玻璃黑:     #00000080 (角色气泡)
毛玻璃深:     #0000004D (导航栏/卡片)
白色文本:     #FFFFFF
次级文本:     #FFFFFFBF (简介)
弱文本:       #FFFFFF80 (对话数/创作者)
占位文本:     #FFFFFF4D (输入框)
分割线:       #FFFFFF14
描边:         #FFFFFF1F (头像外描边)
输入框边框:   #FFFFFF29
AI 强调色:    #FFE62C (AI 续写按钮)
语音按钮背景: #3A3A3ABF
```

**字体系统**：
```
字体: PingFang SC
气泡文本:     15px / normal
角色名称:     14px / 500
简介文案:     12px / 500
对话数/创作者: 10px / normal / lineHeight:1.2
关注按钮:     12px / 500 / lineHeight:1.33
输入框:       16px / normal
语音时长:     12px / normal / lineHeight:1.67
```

**间距系统**：
```
4px  — 导航栏内按钮 gap / 头像与语音按钮 gap
6px  — 语音按钮内 gap
8px  — 卡片内 gap / 导航栏 padding-y
10px — 输入框底部 gap
12px — 卡片 padding / 视频与简介 gap
16px — 气泡 padding / 输入框 gap / 导航栏 padding-x
```

**圆角系统**：
```
6px  — 气泡小圆角（发送方右下 / 接收方左上）
8px  — 视频缩略图
16px — 开场卡片 / 语音播放按钮
18px — 功能按钮
22px — 气泡大圆角
25px — 关注按钮
27px — 输入框
29px — 导航栏返回/菜单按钮
```

**毛玻璃半径**：
```
17.5px  — 用户气泡
26.25px — 导航按钮 / 语音播放按钮
43.75px — 角色说话气泡
70px    — 开场卡片
```

---

## 四、已确定的工程化方案

### 4.1 Git Submodule 架构

```
新项目/
├── designs/                    ← Git Submodule（设计师管理的独立仓库）
│   ├── pages/                  ← 页面级设计稿 (.pen)
│   ├── components/             ← 组件级设计稿 (.pen)
│   └── tokens/                 ← Design Token 设计稿
├── src/
│   ├── components/             ← React 组件（从设计生成）
│   ├── pages/                  ← 页面代码
│   └── styles/
│       └── tokens.scss         ← 从设计稿提取的 Token 变量
├── .cursor/
│   ├── rules/                  ← AI 规则（自动注入）
│   │   ├── project.mdc         ← 项目级约束
│   │   ├── pencil-design.mdc   ← Pencil 设计稿规则
│   │   ├── component.mdc       ← 组件开发规范
│   │   └── style.mdc           ← 样式规范
│   └── skills/                 ← Prompt 模板（手动 @ 引用）
│       ├── 01-design-review.md
│       ├── 02-extract-tokens.md
│       ├── 03-component-mapping.md
│       ├── 04-gen-component.md
│       ├── 05-gen-page.md
│       └── 06-visual-check.md
├── scripts/                    ← 自动化工具
│   ├── extract-tokens.ts
│   ├── gen-component.ts
│   └── visual-diff.ts
├── CONTEXT.md                  ← 本文件
└── package.json
```

### 4.2 设计师协作模式

| 模式 | 适用场景 | 工具 |
|------|---------|------|
| 模式 A：Figma 过渡 | 设计师不碰 Git | 设计师用 Figma → 开发者导入 Pencil |
| 模式 B：轻度参与 | 设计师会基础 Git | 设计师用 Cursor+Pencil + GitHub Desktop |
| 模式 C：深度参与 | 全栈团队 | 设计师和开发者同一套工具链 |

### 4.3 Pencil 只支持本地文件
- 不能远程读取 .pen
- 必须通过 Git pull 同步到本地
- 这是 Git Submodule 方案的核心原因

---

## 五、开发 SOP（6步标准流程）

```
Step 1: 设计审查     → 打开 .pen，列出组件清单，检查命名/层级/布局
Step 2: Token 提取   → 扫描颜色/字号/间距，生成 tokens.scss
Step 3: 组件映射     → .pen 节点名 → React 组件名 + TypeScript 接口
Step 4: 组件开发     → 逐个生成 TSX + SCSS，每个组件独立可渲染
Step 5: 页面组装     → 读取页面稿坐标/层级，组合组件生成页面
Step 6: 视觉走查     → 截图对比设计稿 vs 实现，列出差异项
```

---

## 六、AI 融合工作流（关键！）

### 6.1 每步的标准 Prompt 模板

**Step 1 设计审查**：
> "帮我审查 @组件.pen，分析组件集结构，列出所有组件的名称、层级、布局方式、关键样式属性"

**Step 2 Token 提取**：
> "帮我从 @组件.pen 提取所有 Design Token，生成 src/styles/tokens.scss 文件"

**Step 3 组件映射**：
> "帮我做组件映射表：@组件.pen 中每个组件的 .pen 节点名 → React 组件名 → TypeScript Props 接口"

**Step 4 组件开发**：
> "帮我根据 @组件.pen 中的 [用户气泡] 节点生成 React 组件，放到 src/components/UserChatBubble/"

**Step 5 页面组装**：
> "帮我根据 @对话页.pen 组装完整页面，引用已生成的组件"

**Step 6 视觉走查**：
> "帮我对比 @对话页.pen 的设计截图和当前实现，列出所有视觉差异"

### 6.2 AI 在每步自动执行的动作

| Step | AI 使用的 MCP 工具 | 输出 |
|------|-------------------|------|
| 1 审查 | `batch_get` + `get_screenshot` | 组件清单表格 |
| 2 Token | `search_all_unique_properties` | tokens.scss 文件 |
| 3 映射 | `batch_get`（读取每个节点） | 映射表 + TypeScript interface |
| 4 开发 | `batch_get` → 生成代码 → `get_screenshot` | TSX + SCSS 文件 |
| 5 组装 | `snapshot_layout` → 生成页面代码 | 页面 TSX 文件 |
| 6 走查 | `get_screenshot` → 对比 | 差异列表 |

---

## 七、三层体系设计（待落地）

### 7.1 Layer 1: Rules（.cursor/rules/）

自动注入到每次 AI 对话，约束 AI 行为：

**project.mdc**：
- 技术栈约束（React + TypeScript + SCSS）
- 目录约定
- 禁止使用 Tailwind
- 移动端适配方案

**pencil-design.mdc**：
- 读 .pen 文件必须用 Pencil MCP 工具
- 生成代码前必须先 batch_get 读取完整结构
- 生成后必须 get_screenshot 做视觉对比
- 颜色值必须从设计稿提取

**component.mdc**：
- 命名映射规则
- Props 接口必须定义 TypeScript interface
- 每个组件 index.tsx + index.module.scss
- 样式变量必须引用全局 Token

**style.mdc**：
- Token 变量命名规则
- 毛玻璃效果标准写法
- 禁止硬编码 hex 颜色

### 7.2 Layer 2: Tools（scripts/）

- `extract-tokens.ts` — 从 .pen 提取 Token → SCSS 变量
- `gen-component.ts` — 根据 .pen 节点生成组件脚手架
- `visual-diff.ts` — 截图对比

### 7.3 Layer 3: Skills（.cursor/skills/）

标准化 Prompt 模板，每个文件包含：
- 触发条件
- 输入要求
- 标准 Prompt
- 期望输出
- 验收标准

---

## 八、组件命名映射参考

| .pen 节点名称 | React 组件名 | 文件路径 |
|--------------|-------------|---------|
| 顶部导航栏 | `ChatNavBar` | `src/components/ChatNavBar/` |
| 角色开场卡片（无视频） | `CharacterCard` | `src/components/CharacterCard/` |
| 角色开场卡片（有视频） | `CharacterCard` (variant) | 同上，通过 props 切换 |
| 用户气泡 | `UserChatBubble` | `src/components/UserChatBubble/` |
| 角色说话气泡 | `CharacterChatBubble` | `src/components/CharacterChatBubble/` |
| 用户头像 + 语音播放 | `VoicePlayer` | `src/components/VoicePlayer/` |
| 底部输入框 | `ChatInputBar` | `src/components/ChatInputBar/` |
| 发送按钮 | `SendButton` | `src/components/SendButton/` |

---

## 九、接下来要做的事

1. **P0**: 创建 `.cursor/rules/` 下的 4 个规则文件
2. **P1**: 创建 `.cursor/skills/` 下的 6 个技能模板
3. **P2**: 创建 `scripts/` 下的自动化工具
4. **P3**: 用实际设计稿（组件.pen + 对话页.pen）跑通完整流程验证

---

## 十、相关文档

- 原项目已生成的协作文档: `PENCIL_COLLABORATION.md`（完整的 12 章节工程化协作计划）
- Pencil 官方文档: https://docs.pencil.dev/
- Pencil 官网: https://www.pencil.dev/

---

*本文件由 AI 自动生成，用于跨编辑器窗口恢复对话上下文。*
