import { PageContainer } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';


// const AccessPage: React.FC = () => {
// 	const access = useAccess();
// 	const [count, setCount] = useState(0);

// 	useEffect(() => {
// 		setTimeout(() => {
// 			setCount(count + 1,);
// 			console.log('count:', count);
// 		}, 0);
// 		console.log('count:', count);
// 	}, []);

// 	const clickHandler = () => {
// 		setTimeout(() => {
// 			setCount(count + 1,);
// 			console.log('count:', count);
// 		}, 0);
// 		console.log('count:', count);
// 	}

// 	return (
// 		<PageContainer
// 			ghost
// 			header={{
// 				title: '权限示例',
// 			}}
// 		>
// 			<Access accessible={access.canSeeAdmin}>
// 				<div onClickCapture={clickHandler}>test</div>
// 				{/* <Button>只有 Admin 可以看到这个按钮</Button> */}
// 			</Access>
// 			{count}
// 		</PageContainer>
// 	);
// };
class Children extends React.Component {
	state: Readonly<any>;
	constructor(props: any) {
		super(props);
		console.log('props:', props);
		this.state = {
			count: props?.count
		}
	}

	render(): React.ReactNode {
		return (
			<>
				<div>{this.state.count}</div>
			</>
		)
	}
}

class AccessPage extends React.Component {

	constructor(props: any) {
		super(props);
		this.state = {
            count: 0,
			time: 0,
        }
	}

	clickHandler = () => {
		setTimeout(() => {
			this.setState({
				count: this.state.count + 1
			})
			this.setState({
				time: this.state.time + 2
			})
		}, 0);
		// console.log('count:', this.state.count);
	}

	render() {
		console.log('in render:', this.state.count,this.state.time);
		return (
			<>
				<div onClickCapture={this.clickHandler}>test</div>
				{this.state.count}
				{this.state.time}
				<Children count={this.state.count}></Children>
			</>
		)
	}
}

export default AccessPage;
