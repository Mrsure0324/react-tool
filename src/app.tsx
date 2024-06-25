import CAIXVKUN from '@/static/image/7964710a-23a0-11eb-a6a2-aa3e3c-unscreen.gif'
import { Provider } from 'react-redux';
import { store } from './store';
import React from 'react';
import './init.less'

// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string }> {
	return { name: '你干嘛~',  };
}

export const layout = () => {
	return {
		logo: 'https://img.aidotu.com/down/gif/20200928/cb5ad6949e3534c922131b61b09f2565_59676_240_240.gif',
		menu: {
			locale: false,
		},
		rightRender() {
			return (
				<>
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					{/* <img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} />
					<img style={{width: '20px',height:'20px'}} src={CAIXVKUN} /> */}
				</>
			)
		}
	};
};