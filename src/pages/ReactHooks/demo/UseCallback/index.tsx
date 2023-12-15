import React, { memo, useCallback, useState } from 'react'
import { Button } from 'antd';

export interface UseCallbackProps {
    
}

const Child = ({
    submit
}:any) => {

    console.log('Child Render')

    return (
        <>
            <h3>Child</h3>
        </>
    )
}

const ChildMemo = memo(({
    submit
}:any) => {

    console.log('ChildMemo Render')

    return (
        <>
            <h3>ChildMemo</h3>
        </>
    )
});

const UseCallback  = (props:UseCallbackProps) => {

    const {
        
    } = props;

    const [count,setCount] = useState(0);

    const submit = useCallback(() => {
        console.log('submit')
    },[])

    return (
        <>
            <h1>UseCallback</h1>
            <p>count:{count}</p>
            <Button onClick={() => setCount(count + 1)}>count++</Button>
            <Child submit={submit}></Child>
            <ChildMemo submit={submit}></ChildMemo>
        </>
    )
}

export default UseCallback