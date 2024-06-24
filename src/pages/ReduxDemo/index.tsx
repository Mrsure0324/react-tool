import React from 'react'
import styles from './index.module.less'
import { decrement, increment, incrementByAmount, getReduxValue} from '@/store/slices/sureSlice'
import { useSelector, useDispatch } from 'react-redux'
import { Button } from 'antd';
import { useRequest } from 'umi';
export interface ReduxDemoProps {
    
}

const ReduxDemo:React.FC<ReduxDemoProps> = () => {

    const count = useSelector((state:any) => state.sure.value)
    const dispatch = useDispatch();

    return (
        <>
            <div style={{fontSize: '20px', color: 'red'}}>
                {count}
            </div>
            <Button onClick={() => dispatch(increment())}>+</Button>
            <Button onClick={() => dispatch(decrement())}>-</Button>
            <Button onClick={() => dispatch(incrementByAmount(5))}>+5</Button>
            <Button onClick={() => dispatch(getReduxValue())}>request</Button>
        </>
    )
}
export default ReduxDemo