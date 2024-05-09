import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'Sure-Tool-Demo',
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '权限演示',
      path: '/access',
      component: './Access',
    },
    {
      name: ' CRUD 示例',
      path: '/table',
      component: './Table',
    },
    {
      name: 'sql编辑器',
      path: '/sql-editor',
      component: './SqlEditor',
    },
    {
      name: 'Context测试',
      path: '/context',
      component: './Context',
    },
    {
      name: 'WebComponents',
      path: '/WebComponents',
      component: './WebComponents',
    },
    {
      name: 'React Hooks',
      path: '/react-hooks-demo',
      component: './ReactHooks',
    },
    {
      name: 'Markdown',
      path: '/md-demo',
      component: './Markdown',
    },
    {
      name: 'Markdown-Marked',
      path: '/md-marked',
      component: './MarkdownMarked',
    },
    {
      name: 'EditorTable-Antd',
      path: '/editor-table-antd',
      component: './EditorTableAntd',
    },
  ],
  npmClient: 'pnpm',
});

