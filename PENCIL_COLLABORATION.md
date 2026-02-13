# Pencil & 前端工程化协作计划

> 项目: react-tool | 技术栈: Umi Max + React + Ant Design + TypeScript
>
> 设计工具: [Pencil](https://www.pencil.dev/) (Cursor IDE 插件)
>
> 最后更新: 2026-02-08

---

## 目录

1. [整体架构](#1-整体架构)
2. [仓库结构 & Git Submodule](#2-仓库结构--git-submodule)
3. [设计文件规范](#3-设计文件规范)
4. [角色与职责](#4-角色与职责)
5. [设计师工作流](#5-设计师工作流)
6. [开发者工作流](#6-开发者工作流)
7. [Design → Code 流程](#7-design--code-流程)
8. [Figma → Pencil 桥接方案](#8-figma--pencil-桥接方案)
9. [自动化脚本 & 工具配置](#9-自动化脚本--工具配置)
10. [分支策略 & Review 流程](#10-分支策略--review-流程)
11. [CI/CD 集成](#11-cicd-集成)
12. [FAQ](#12-faq)

---

## 1. 整体架构

```
┌─────────────────────────────────────────────────────┐
│                    设计师                             │
│  Figma / Cursor+Pencil → .pen 文件 → Git Push        │
└──────────────────────┬──────────────────────────────┘
                       │ Git Submodule
                       ▼
┌─────────────────────────────────────────────────────┐
│                  主项目 react-tool                     │
│                                                     │
│  designs/          ← Submodule (设计仓库)             │
│  ├── pages/        ← 页面级设计稿                     │
│  ├── components/   ← 组件级设计稿                     │
│  ├── tokens/       ← 设计 Token（颜色/字体/间距）      │
│  └── README.md     ← 设计规范说明                     │
│                                                     │
│  src/                                               │
│  ├── components/   ← 组件代码（从设计生成/手写）        │
│  ├── pages/        ← 页面代码                        │
│  └── styles/       ← 全局样式 Token                   │
└─────────────────────────────────────────────────────┘
```

### 核心原则

| 原则 | 说明 |
|------|------|
| **设计即代码** | `.pen` 文件以 JSON 存储，纳入版本管理 |
| **仓库隔离** | 设计文件独立仓库，通过 Submodule 引用 |
| **单一数据源** | 设计稿是 UI 的唯一真实来源（Single Source of Truth） |
| **本地优先** | Pencil 是本地工具，通过 Git 同步协作 |
| **渐进采用** | 支持 Figma 过渡，不要求一步到位 |

---

## 2. 仓库结构 & Git Submodule

### 2.1 仓库规划

| 仓库 | 地址（示例） | 管理者 | 说明 |
|------|-------------|--------|------|
| 主项目 | `github.com/team/react-tool` | 开发者 | 前端代码 |
| 设计仓库 | `github.com/team/react-tool-designs` | 设计师 | `.pen` 设计文件 |

### 2.2 初始化设计仓库

```bash
# 1. 创建设计仓库
mkdir react-tool-designs
cd react-tool-designs
git init

# 2. 建立目录结构
mkdir -p pages components tokens
touch README.md

# 3. 移入现有设计文件
cp /path/to/react-tool/pen/*.pen pages/

# 4. 初始提交
git add .
git commit -m "init: 初始化设计文件仓库"
git remote add origin git@github.com:team/react-tool-designs.git
git push -u origin main
```

### 2.3 在主项目中添加 Submodule

```bash
cd /path/to/react-tool

# 移除旧的 pen 目录（如有）
rm -rf pen

# 添加 Submodule，挂载到 designs/ 目录
git submodule add git@github.com:team/react-tool-designs.git designs
git commit -m "feat: 添加设计文件 submodule"
git push
```

### 2.4 主项目最终目录结构

```
react-tool/
├── designs/                    ← Git Submodule（设计仓库）
│   ├── pages/
│   │   ├── Home.pen            ← 首页设计稿
│   │   ├── Login.pen           ← 登录页设计稿
│   │   ├── Dashboard.pen       ← 仪表盘设计稿
│   │   └── Chat.pen            ← 对话页设计稿
│   ├── components/
│   │   ├── Button.pen          ← 按钮组件设计
│   │   ├── Card.pen            ← 卡片组件设计
│   │   └── Form.pen            ← 表单组件设计
│   ├── tokens/
│   │   └── design-tokens.pen   ← 设计 Token（颜色/字体/间距）
│   └── README.md
├── src/
│   ├── components/             ← 组件代码
│   ├── pages/                  ← 页面代码
│   └── styles/                 ← 从 Token 生成的样式变量
├── package.json
├── .gitmodules
└── PENCIL_COLLABORATION.md     ← 本文档
```

---

## 3. 设计文件规范

### 3.1 文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面设计 | `PascalCase.pen` | `Home.pen`, `UserProfile.pen` |
| 组件设计 | `PascalCase.pen` | `SearchBar.pen`, `DataTable.pen` |
| Token | `kebab-case.pen` | `design-tokens.pen` |

### 3.2 命名与代码的映射关系

```
设计文件                          代码文件
designs/pages/Home.pen      →   src/pages/Home/index.tsx
designs/pages/Login.pen     →   src/pages/Login/index.tsx
designs/components/Card.pen →   src/components/Card/index.tsx
```

### 3.3 设计稿内部规范

每个 `.pen` 文件内部建议包含以下 Frame：

| Frame 名称 | 说明 |
|-----------|------|
| `Desktop` | 桌面端设计（1440×900 或 1920×1080） |
| `Tablet` | 平板端设计（768×1024）可选 |
| `Mobile` | 移动端设计（375×812）可选 |
| `Components` | 页面内可复用的子组件 |
| `States` | 交互状态（hover/active/disabled 等） |

---

## 4. 角色与职责

### 设计师

| 职责 | 说明 |
|------|------|
| 创建/维护 `.pen` 设计稿 | 在 Cursor + Pencil 或 Figma 中工作 |
| 定义设计 Token | 颜色、字体、间距、圆角等 |
| 提交到设计仓库 | 通过 Git / GitHub Desktop 推送 |
| 参与设计 Review | 审查开发者的 UI 还原度 |

### 开发者

| 职责 | 说明 |
|------|------|
| 同步设计 Submodule | `pnpm design:sync` |
| 从设计生成代码 | 通过 Pencil + AI 生成 React 组件 |
| 维护代码与设计一致性 | 确保代码实现忠于设计稿 |
| 导入 Figma 设计（如需要） | 协助设计师迁移 Figma → Pencil |

---

## 5. 设计师工作流

### 5.1 方案 A：设计师使用 Cursor + Pencil（推荐）

```
1. git pull                        # 拉取最新（或用 GitHub Desktop）
2. 在 Cursor 中打开 .pen 文件       # 使用 Pencil 编辑器
3. 设计 / 修改 UI
4. git add . && git commit -m "..."  # 提交变更
5. git push                         # 推送到远程
```

#### 工具要求
- [x] 安装 Cursor IDE
- [x] 安装 Pencil 扩展
- [x] 安装 GitHub Desktop（可选，降低 Git 门槛）

### 5.2 方案 B：设计师继续使用 Figma（过渡期）

```
1. 设计师在 Figma 中完成设计
2. 通过飞书/Slack 通知开发者
3. 开发者从 Figma 复制粘贴到 Pencil
4. 开发者提交 .pen 文件到设计仓库
```

### 5.3 设计师 Git 速查卡

提供给设计师的极简 Git 指南（配合 GitHub Desktop 使用）：

```
╔════════════════════════════════════════════════╗
║           设计师 Git 速查卡                      ║
╠════════════════════════════════════════════════╣
║                                                ║
║  📥 开始工作前：                                 ║
║     点击 "Fetch origin" → "Pull"               ║
║                                                ║
║  💾 完成设计后：                                 ║
║     1. 左侧查看改动的文件                        ║
║     2. 写一句描述（如："更新首页设计"）            ║
║     3. 点击 "Commit to main"                   ║
║     4. 点击 "Push origin"                      ║
║                                                ║
║  ⚠️ 遇到冲突：找开发者帮忙解决                    ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## 6. 开发者工作流

### 6.1 日常开发流程

```bash
# 1. 同步最新设计
pnpm design:sync

# 2. 在 Cursor 中打开设计稿
#    双击 designs/pages/Home.pen

# 3. 使用 AI 从设计生成 React 代码
#    在 Cursor Chat 中：
#    "根据 designs/pages/Home.pen 生成 src/pages/Home/index.tsx"

# 4. 手动调整生成的代码

# 5. 提交代码（主项目）
git add src/
git commit -m "feat: 实现首页 UI"

# 6. 如果 submodule 有更新，也一并提交
git add designs
git commit -m "sync: 同步最新设计稿"
```

### 6.2 首次 clone 项目

```bash
# 新成员克隆项目（包含 submodule）
git clone --recurse-submodules git@github.com:team/react-tool.git

# 或者已经 clone 了，补初始化 submodule
cd react-tool
git submodule init
git submodule update
```

---

## 7. Design → Code 流程

### 7.1 AI 辅助生成代码

在 Cursor Chat 中，可以通过以下方式让 AI 从设计稿生成代码：

```
提示词示例：

1. "打开 designs/pages/Login.pen，根据设计生成 React + TypeScript 组件，
    使用 Ant Design 组件库，样式用 Less Modules"

2. "根据 designs/components/Card.pen 设计稿，
    生成 src/components/Card/index.tsx，
    保持与现有项目风格一致（参考 src/components/ 下其他组件）"

3. "对比 designs/pages/Home.pen 和 src/pages/Home/index.tsx，
    找出 UI 还原度差异并修复"
```

### 7.2 设计 Token 同步

从 Pencil 的设计 Token 生成 CSS/Less 变量：

```less
// src/styles/design-tokens.less
// 由 Pencil Token 生成，请勿手动修改

// 颜色
@color-primary: #7259FF;
@color-bg-dark: #404E66;
@color-text-white: #FFFFFF;
@color-text-secondary: #FFFFFFCC;

// 间距
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-md: 12px;
@spacing-lg: 16px;
@spacing-xl: 24px;

// 圆角
@radius-sm: 6px;
@radius-md: 16px;
@radius-lg: 22px;

// 模糊
@blur-sm: 17.5px;
@blur-md: 26.25px;
@blur-lg: 43.75px;
```

### 7.3 代码生成 Checklist

每次从设计生成代码后，检查以下项：

- [ ] 组件结构与设计稿一致
- [ ] 颜色使用设计 Token 变量，不硬编码
- [ ] 间距/圆角使用 Token
- [ ] 响应式断点处理（如有多端设计）
- [ ] 交互状态（hover/active/disabled）
- [ ] 无障碍（aria 标签）
- [ ] TypeScript 类型定义完整

---

## 8. Figma → Pencil 桥接方案

适用于团队从 Figma 过渡到 Pencil 的阶段：

### 8.1 导入流程

```
Figma                          Pencil
  │                              │
  ├── 选择设计元素                  │
  ├── Cmd+C 复制                  │
  │                              ├── 在 Pencil 画布 Cmd+V 粘贴
  │                              ├── 调整布局/属性
  │                              └── 保存 .pen 文件
```

### 8.2 注意事项

| 事项 | 说明 |
|------|------|
| 字体 | 确保本地安装了 Figma 中使用的字体（如 PingFang SC） |
| 图片 | 图片资源需要单独导出，Pencil 中重新引用 |
| 组件 | Figma 组件不会自动转为 Pencil 组件，需重新创建 |
| 自动布局 | Figma Auto Layout → Pencil Flex Layout，需手动检查 |

---

## 9. 自动化脚本 & 工具配置

### 9.1 package.json 脚本

```json
{
  "scripts": {
    "design:sync": "git submodule update --remote designs && echo '✅ 设计稿已同步到最新'",
    "design:init": "git submodule init && git submodule update && echo '✅ 设计子模块已初始化'",
    "design:status": "cd designs && git log --oneline -5 && echo '---' && git status",
    "design:open": "code designs/",
    "postinstall": "max setup && git submodule update --init"
  }
}
```

### 9.2 Git Hooks（Husky）

```bash
# .husky/pre-commit
# 提交前检查 submodule 是否有未同步的更新

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 检查 designs submodule 是否有新的远程提交
cd designs
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "none")
if [ "$REMOTE" != "none" ] && [ "$LOCAL" != "$REMOTE" ]; then
  echo "⚠️  设计仓库有未同步的更新，建议运行: pnpm design:sync"
fi
cd ..

npx lint-staged
```

### 9.3 .gitmodules 配置

```ini
# .gitmodules
[submodule "designs"]
    path = designs
    url = git@github.com:team/react-tool-designs.git
    branch = main
```

### 9.4 .gitignore 补充

```gitignore
# 不忽略 .pen 文件（确保设计文件被跟踪）
!*.pen

# 忽略 Pencil 临时文件（如有）
*.pen.bak
*.pen.tmp
```

---

## 10. 分支策略 & Review 流程

### 10.1 设计仓库分支策略

```
main                 ← 已确认的设计稿（受保护）
├── feat/home-v2     ← 首页改版设计
├── feat/login       ← 登录页新设计
└── fix/button-style ← 修复按钮样式
```

### 10.2 Review 流程

```
设计师创建分支 → 完成设计 → 提交 PR → 开发者 Review → 合并到 main
                                        │
                                        ├── 检查设计规范是否一致
                                        ├── 检查是否可实现
                                        ├── 检查 Token 是否复用
                                        └── 确认与开发计划匹配
```

### 10.3 PR 模板（设计仓库）

```markdown
## 设计变更说明

**页面/组件**: [填写名称]
**变更类型**: [ ] 新增 / [ ] 修改 / [ ] 删除

### 变更内容
- 

### 截图预览
（粘贴设计截图）

### 关联需求
- JIRA/飞书链接: 

### Checklist
- [ ] 遵循设计 Token 规范
- [ ] 包含必要的交互状态
- [ ] 命名符合规范
```

---

## 11. CI/CD 集成

### 11.1 设计仓库 CI（可选）

```yaml
# .github/workflows/design-check.yml
name: Design Check

on:
  pull_request:
    paths: ['**.pen']

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 检查文件命名规范
        run: |
          # 检查 pages/ 下的文件是否为 PascalCase
          for f in pages/*.pen; do
            basename=$(basename "$f" .pen)
            if ! echo "$basename" | grep -qE '^[A-Z][a-zA-Z0-9]*$'; then
              echo "❌ 命名不规范: $f (应为 PascalCase)"
              exit 1
            fi
          done
          echo "✅ 文件命名检查通过"

      - name: 检查文件大小
        run: |
          # 警告超过 5MB 的设计文件
          find . -name "*.pen" -size +5M | while read f; do
            echo "⚠️  文件较大: $f ($(du -h "$f" | cut -f1))"
          done
```

### 11.2 主项目 CI 集成

```yaml
# 在主项目的 CI 中确保 submodule 正确初始化
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive  # 自动初始化 submodule
      - run: pnpm install
      - run: pnpm build
```

---

## 12. FAQ

### Q: 设计师不会用 Git 怎么办？
**A:** 安装 [GitHub Desktop](https://desktop.github.com/)，只需要会三个操作：Pull → Commit → Push。参考本文第 5.3 节的速查卡。

### Q: .pen 文件冲突怎么解决？
**A:** `.pen` 文件是 JSON 格式，理论上可以 diff/merge。但建议通过**分工约定**（不同人负责不同文件）来避免冲突。如果确实冲突了，以最新的设计稿为准，由设计师重新提交。

### Q: 设计师还在用 Figma，Pencil 文件谁来维护？
**A:** 过渡期由开发者从 Figma 导入到 Pencil，提交到设计仓库。长期目标是设计师逐步迁移到 Pencil。

### Q: Pencil 生成的代码质量如何？
**A:** AI 生成的代码需要人工 Review 和调整，特别是：
- 组件拆分粒度
- 状态管理逻辑
- 业务逻辑接入
- 样式变量替换

### Q: 是否需要每个页面都有 .pen 文件？
**A:** 不需要。建议优先覆盖：
1. 核心页面（首页、登录等）
2. 复杂交互页面
3. 通用组件库

简单页面可以直接开发，无需设计稿。

### Q: Submodule 更新后忘记提交怎么办？
**A:** 已在 `postinstall` 钩子中自动同步。另外 Husky pre-commit 钩子会提醒。

---

## 附录：快速命令参考

| 命令 | 说明 |
|------|------|
| `pnpm design:init` | 首次初始化设计子模块 |
| `pnpm design:sync` | 同步最新设计稿 |
| `pnpm design:status` | 查看设计仓库状态 |
| `pnpm design:open` | 在 Cursor 中打开设计目录 |

---

*本文档随项目演进持续更新。*
