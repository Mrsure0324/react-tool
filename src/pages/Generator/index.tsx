import React, { useEffect,useRef } from 'react'
import styles from './index.module.less'

export interface GeneratorProps {
    
}

const asyncTask1 = () => {
    setTimeout(() => {
        // console.log('asyncTask1');
        return 'asyncTask1'
    },1000);
    return ''
} 
const asyncTask2 = () => {
    setTimeout(() => {
        // console.log('asyncTask1');
        return 'asyncTask2'
    },2000)
    return ''
} 

const asyncTask3 = () => {
    setTimeout(() => {
        // console.log('asyncTask1');
        return 'asyncTask3'
    },3000)
    return ''
} 

const Generator:React.FC<GeneratorProps> = (props) => {

    const {
        
    } = props;

    const ref = useRef(null)

    useEffect(() => {
        appendDom();
    })

    const appendDom = () => {
        const appendDom = document.getElementById('appendDom');
        const child = document.createElement('div')
        child.innerHTML = 'Sure';
        appendDom?.appendChild(child);
        console.log('ref',ref?.current?.getElementsByTagName("div"));
    }



    return (
        <>
            基于Generator实现DOM插入:
            <div ref={ref} id='appendDom'></div>
        </>
    )
}
export default Generator