import { defineConfig } from '@umijs/max';
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const smp = new SpeedMeasurePlugin();

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
			name: '',
			path: '/home',
			component: './Home',
		},
		{
			name: 'UNO',
			path: '/UNO',
			component: './UNO',
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
		// {
		//   name: 'Markdown-Marked',
		//   path: '/md-marked',
		//   component: './MarkdownMarked',
		// },
		{
			name: 'EditorTable-Antd',
			path: '/editor-table-antd',
			component: './EditorTableAntd',
		},
		{
			name: 'ReactGridLayout',
			path: '/ReactGridLayout',
			component: './ReactGridLayout',
		},
		{
			name: 'ReactConditionFilterDemo',
			path: '/ReactConditionFilterDemo',
			component: './ReactConditionFilterDemo',
		},
		{
			name: 'ReduxDemo',
			path: '/ReduxDemo',
			component: './ReduxDemo',
		},
		{
			name: 'Generator',
			path: '/Generator',
			component: './Generator',
		},
		{
			name: '图片标注',
			path: '/ImageLabel',
			component: './ImageLabel',
		},
		{
			name: 'NLUX',
			path: '/NLUX',
			component: './NLUX',
		},
	],
	npmClient: 'pnpm',
	esbuildMinifyIIFE: true,
	chainWebpack(memo, args) {
		// memo
		// 	.plugin('speed-measure-webpack-plugin')
		// 	.use(SpeedMeasurePlugin)
		// 	.end();

		// memo
		// 	.plugin('webpack-bundle-analyzer')
		// 	.use(BundleAnalyzerPlugin)
		// 	.end();

		// memo
		// 	.optimization
		// 	.splitChunks({
		// 		chunks: 'all',
		// 		// cacheGroups: {
		// 		// 	lodash: {
		// 		// 		test:/lodash/,
		// 		// 		name: "lodash"
		// 		// 	},
		// 		// 	react: {
		// 		// 		test: /react|react-dom/,
		// 		// 		name: "react"
		// 		// 	}
		// 		// }
		// 	})
		return memo;
	},
});

